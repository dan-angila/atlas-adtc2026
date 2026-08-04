//! Memory Manager: RAM-tier selection per
//! `docs/adr/0006-quantization-model-tiering-ram-envelope.md`, and
//! process-level memory monitoring for the Metrics Collector.

use atlas_domain::RamTier;
use sysinfo::{Pid, System};

use super::hardware::HardwareProfile;

/// The threshold below which a machine is treated as the Constrained
/// tier rather than Standard.
///
/// ADR-0006 frames the Standard tier around an 8GB *nominal* machine,
/// but OS-reported total memory is routinely a few hundred MB under the
/// marketing figure (firmware-reserved memory, etc. — this project's own
/// development machine reports ~7.6GiB on an "8GB" laptop). `7 GiB` is
/// the threshold rather than `8 GiB` so real 8GB hardware doesn't get
/// misclassified as Constrained purely due to reporting slack — the
/// Standard/Constrained line is about "does this machine have the RAM
/// class ADR-0006 designed the Standard tier around," not about hitting
/// a nominal number exactly.
const STANDARD_TIER_MIN_TOTAL_BYTES: u64 = 7 * 1024 * 1024 * 1024;

/// The RAM tier selected for this run, with the reasoning that produced
/// it — surfaced to the user per ADR-0006 ("silently degrading answer
/// quality without telling the user is a worse outcome than telling them
/// plainly").
#[derive(Debug, Clone, PartialEq)]
pub struct TierDecision {
    /// The selected tier.
    pub tier: RamTier,
    /// Total system memory this decision was based on, in bytes.
    pub total_memory_bytes: u64,
    /// Human-readable explanation, suitable for direct display to a
    /// user or for a log line — not internal-only debug detail.
    pub reasoning: String,
}

/// Selects a RAM tier for `hardware`, per ADR-0006.
///
/// This is a pure function of a [`HardwareProfile`] — it does not
/// re-detect hardware itself, so callers control when (and how often)
/// re-detection happens versus reusing a cached profile.
#[must_use]
pub fn select_tier(hardware: &HardwareProfile) -> TierDecision {
    if hardware.total_memory_bytes >= STANDARD_TIER_MIN_TOTAL_BYTES {
        TierDecision {
            tier: RamTier::Standard,
            total_memory_bytes: hardware.total_memory_bytes,
            reasoning: format!(
                "{:.1} GiB total system memory meets the Standard tier threshold",
                bytes_to_gib(hardware.total_memory_bytes)
            ),
        }
    } else {
        TierDecision {
            tier: RamTier::Constrained,
            total_memory_bytes: hardware.total_memory_bytes,
            reasoning: format!(
                "{:.1} GiB total system memory is below the {:.0} GiB Standard tier threshold",
                bytes_to_gib(hardware.total_memory_bytes),
                bytes_to_gib(STANDARD_TIER_MIN_TOTAL_BYTES)
            ),
        }
    }
}

fn bytes_to_gib(bytes: u64) -> f64 {
    bytes as f64 / (1024.0 * 1024.0 * 1024.0)
}

/// Reports the current process's own resident memory usage (RSS), in
/// bytes — the Metrics Collector's source for "RAM usage" of BRIX Atlas
/// itself, as distinct from total/available system memory
/// ([`HardwareProfile`]).
///
/// Returns `None` if the current process's own entry cannot be found in
/// the system's process table — should not happen in practice (a
/// process can always see itself), but this is system-call-backed I/O
/// and per `docs/engineering-standards.md` gets a typed `Option`/`Result`
/// rather than a panic if the OS ever disagrees.
#[must_use]
pub fn current_process_memory_bytes() -> Option<u64> {
    let pid = Pid::from_u32(std::process::id());
    let mut system = System::new();
    system.refresh_processes(sysinfo::ProcessesToUpdate::Some(&[pid]), true);
    system.process(pid).map(sysinfo::Process::memory)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hardware_with_total_gib(gib: f64) -> HardwareProfile {
        HardwareProfile {
            total_memory_bytes: (gib * 1024.0 * 1024.0 * 1024.0) as u64,
            available_memory_bytes: 0,
            physical_core_count: 4,
            logical_core_count: 8,
            cpu_brand: "test-cpu".to_string(),
        }
    }

    #[test]
    fn eight_gib_machine_selects_standard_tier() {
        let decision = select_tier(&hardware_with_total_gib(8.0));
        assert_eq!(decision.tier, RamTier::Standard);
    }

    #[test]
    fn seven_point_six_gib_machine_selects_standard_tier() {
        // This project's own development machine reports this figure —
        // real 8GB hardware must not be misclassified as Constrained.
        let decision = select_tier(&hardware_with_total_gib(7.6));
        assert_eq!(decision.tier, RamTier::Standard);
    }

    #[test]
    fn four_gib_machine_selects_constrained_tier() {
        let decision = select_tier(&hardware_with_total_gib(4.0));
        assert_eq!(decision.tier, RamTier::Constrained);
    }

    #[test]
    fn tier_decision_reasoning_is_human_readable_and_nonempty() {
        let decision = select_tier(&hardware_with_total_gib(8.0));
        assert!(!decision.reasoning.is_empty());
        assert!(decision.reasoning.contains("GiB"));
    }

    #[test]
    fn current_process_memory_is_nonzero_for_a_running_process() {
        let memory = current_process_memory_bytes();
        assert!(memory.is_some());
        assert!(memory.unwrap() > 0, "a running process always has some RSS");
    }
}
