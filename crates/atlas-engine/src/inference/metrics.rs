//! Metrics Collector.
//!
//! A single live snapshot of everything the Runtime exposes for
//! optimization against the Africa Deep Tech Challenge scoring criteria:
//! current model, quantization, RAM usage, CPU usage, threads, context
//! size, tokens/sec, latency, temperature (when available), inference
//! status, and model capabilities.

use std::sync::RwLock;

use atlas_domain::{ModelFamily, Quantization, RuntimeStatus};
use sysinfo::{Pid, System};

/// A point-in-time snapshot of the Runtime's operational state.
///
/// Every field beyond `status` is `Option` — most are only meaningful
/// once a model is loaded (or, for hardware-level fields, only
/// meaningful on platforms that expose them at all, e.g. CPU
/// temperature). A `None` here means "not currently known," never a
/// fabricated placeholder value — see `docs/engineering-standards.md`'s
/// prohibition on fake benchmarking data.
#[derive(Debug, Clone, PartialEq)]
pub struct RuntimeMetrics {
    /// Current lifecycle state.
    pub status: RuntimeStatus,
    /// Name of the currently loaded model, if any.
    pub current_model: Option<String>,
    /// The currently loaded model's architecture family.
    pub model_family: Option<ModelFamily>,
    /// The currently loaded model's quantization.
    pub quantization: Option<Quantization>,
    /// This process's own resident memory usage, in bytes.
    pub process_memory_bytes: Option<u64>,
    /// This process's own CPU usage, as a percentage (0-100 per core;
    /// can exceed 100 on a multi-core machine under full load).
    pub cpu_usage_percent: Option<f32>,
    /// Thread count configured for the current inference worker.
    pub thread_count: Option<i32>,
    /// Context window size, in tokens, the current model was loaded
    /// with.
    pub context_size: Option<u32>,
    /// Tokens/second from the most recently completed generation.
    pub tokens_per_second: Option<f64>,
    /// Wall-clock latency of the most recently completed generation, in
    /// milliseconds.
    pub last_latency_ms: Option<u64>,
    /// CPU temperature, in Celsius, if the platform exposes a readable
    /// sensor. Frequently `None` — many desktop/VM environments do not
    /// expose this, which is expected, not an error.
    pub cpu_temperature_celsius: Option<f32>,
    /// Free-form capability tags for the currently loaded model (e.g.
    /// `"cpu-only"`, `"gguf"`, architecture-specific notes) — a small,
    /// extensible list rather than a fixed struct of booleans, so a new
    /// capability doesn't require a type change.
    pub model_capabilities: Vec<String>,
}

impl Default for RuntimeMetrics {
    fn default() -> Self {
        Self {
            status: RuntimeStatus::Idle,
            current_model: None,
            model_family: None,
            quantization: None,
            process_memory_bytes: None,
            cpu_usage_percent: None,
            thread_count: None,
            context_size: None,
            tokens_per_second: None,
            last_latency_ms: None,
            cpu_temperature_celsius: None,
            model_capabilities: Vec::new(),
        }
    }
}

/// Holds the live [`RuntimeMetrics`] snapshot, updated by the Runtime
/// Manager as lifecycle events happen and read by anything that needs
/// current state (a future Tauri command, the Benchmark Engine, logs).
///
/// Internally synchronized (`RwLock`) since updates come from the
/// Runtime Manager's request-handling path while reads can come from
/// anywhere (e.g. a UI polling loop) concurrently.
#[derive(Debug, Default)]
pub struct MetricsCollector {
    metrics: RwLock<RuntimeMetrics>,
}

impl MetricsCollector {
    /// A fresh collector with default (idle, all-`None`) metrics.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns a clone of the current metrics snapshot.
    ///
    /// # Panics
    ///
    /// Panics if the internal lock is poisoned (a prior update panicked
    /// while holding the write lock) — this is a genuine programmer-
    /// error invariant violation per `docs/engineering-standards.md`,
    /// not a path reachable from user input.
    #[must_use]
    #[allow(clippy::expect_used)] // justified in this fn's `# Panics` section above
    pub fn snapshot(&self) -> RuntimeMetrics {
        self.metrics
            .read()
            .expect("metrics lock should not be poisoned")
            .clone()
    }

    /// Applies `update` to the current metrics under the write lock.
    ///
    /// # Panics
    ///
    /// Same poisoning caveat as [`MetricsCollector::snapshot`].
    #[allow(clippy::expect_used)] // justified in this fn's `# Panics` section above
    pub fn update(&self, update: impl FnOnce(&mut RuntimeMetrics)) {
        let mut guard = self
            .metrics
            .write()
            .expect("metrics lock should not be poisoned");
        update(&mut guard);
    }
}

/// Reads this process's own CPU usage percentage.
///
/// `sysinfo` requires two refreshes separated by a short interval to
/// compute a meaningful CPU percentage (the first refresh has no prior
/// sample to diff against) — this function performs that wait
/// internally so callers get a real reading in one call, at the cost of
/// blocking for the wait duration. Not meant to be polled in a tight
/// loop; the Runtime Manager calls it periodically, not per-token.
#[must_use]
pub fn read_process_cpu_usage() -> Option<f32> {
    let pid = Pid::from_u32(std::process::id());
    let mut system = System::new();
    system.refresh_processes(sysinfo::ProcessesToUpdate::Some(&[pid]), true);
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    system.refresh_processes(sysinfo::ProcessesToUpdate::Some(&[pid]), true);
    system.process(pid).map(sysinfo::Process::cpu_usage)
}

/// Reads the CPU package temperature, if any sensor exposes one on this
/// platform. Returns `None` on platforms/environments with no readable
/// thermal sensor (common in VMs and some laptops without exposed
/// sensors) — this is expected behavior, not a failure.
#[must_use]
pub fn read_cpu_temperature() -> Option<f32> {
    let components = sysinfo::Components::new_with_refreshed_list();
    components
        .iter()
        .find(|component| {
            let label = component.label().to_lowercase();
            label.contains("cpu") || label.contains("package") || label.contains("core")
        })
        .and_then(sysinfo::Component::temperature)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_metrics_are_idle_with_no_model_loaded() {
        let metrics = RuntimeMetrics::default();
        assert_eq!(metrics.status, RuntimeStatus::Idle);
        assert!(metrics.current_model.is_none());
        assert!(metrics.model_capabilities.is_empty());
    }

    #[test]
    fn collector_snapshot_reflects_updates() {
        let collector = MetricsCollector::new();
        assert_eq!(collector.snapshot().status, RuntimeStatus::Idle);

        collector.update(|metrics| {
            metrics.status = RuntimeStatus::Ready;
            metrics.current_model = Some("test-model".to_string());
        });

        let snapshot = collector.snapshot();
        assert_eq!(snapshot.status, RuntimeStatus::Ready);
        assert_eq!(snapshot.current_model.as_deref(), Some("test-model"));
    }

    #[test]
    fn multiple_updates_accumulate_correctly() {
        let collector = MetricsCollector::new();
        collector.update(|m| m.thread_count = Some(4));
        collector.update(|m| m.context_size = Some(4096));

        let snapshot = collector.snapshot();
        assert_eq!(snapshot.thread_count, Some(4));
        assert_eq!(snapshot.context_size, Some(4096));
    }

    #[test]
    fn read_process_cpu_usage_does_not_panic() {
        // Actual percentage is environment-dependent; this just proves
        // the read path (including the required double-refresh) works.
        let _usage = read_process_cpu_usage();
    }

    #[test]
    fn read_cpu_temperature_does_not_panic_even_without_a_sensor() {
        // None is an entirely expected, correct result in sandboxed/VM
        // environments with no exposed thermal sensor.
        let _temperature = read_cpu_temperature();
    }
}
