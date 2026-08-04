//! Hardware Detection and Capability Detection.
//!
//! Two related but distinct concerns, kept in one file because nothing
//! meaningfully separates them architecturally: **Hardware Detection**
//! answers "what does this machine have" (RAM, CPU core count, CPU
//! model name); **Capability Detection** answers "what can this CPU's
//! instruction set do" (AVX2, AVX-512, FMA). Both feed the Memory
//! Manager's RAM-tier selection (ADR-0006) and — once ADR-0002's open
//! CPU-ISA build/dispatch item is resolved — the choice of which
//! llama.cpp kernel path to use.

use sysinfo::System;

/// A snapshot of the host machine's hardware, as detected at Runtime
/// startup.
#[derive(Debug, Clone, PartialEq)]
pub struct HardwareProfile {
    /// Total physical RAM, in bytes.
    pub total_memory_bytes: u64,
    /// Currently available (not committed) RAM, in bytes. This changes
    /// continuously as other applications run — treat it as a snapshot,
    /// not a durable fact about the machine.
    pub available_memory_bytes: u64,
    /// Number of physical CPU cores, if the OS reports it distinctly
    /// from logical cores (hyperthreading). Falls back to logical count
    /// if unavailable.
    pub physical_core_count: usize,
    /// Number of logical CPU cores (including hyperthreads).
    pub logical_core_count: usize,
    /// CPU model name string, as reported by the OS (e.g.
    /// `"Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz"`).
    pub cpu_brand: String,
}

/// Detects the host machine's hardware profile.
///
/// This performs real system calls (via the `sysinfo` crate) — it is not
/// a stub. It is deliberately a plain function rather than a struct with
/// internal state: hardware detection has no meaningful "instance," and
/// callers who need a live-updating view should call this again rather
/// than expect a cached object to refresh itself.
///
/// # Panics
///
/// Never — if `sysinfo` cannot determine a value (e.g. no physical core
/// count distinct from logical), this function falls back sensibly
/// rather than panicking. A machine this can't get *any* reading from is
/// not a scenario the Runtime can do anything useful about anyway, but
/// even then this returns zeroed fields rather than panicking, since a
/// hardware-detection failure should degrade the Runtime's tier
/// selection, not crash it.
#[must_use]
pub fn detect_hardware() -> HardwareProfile {
    let mut system = System::new_all();
    system.refresh_all();

    let cpu_brand = system
        .cpus()
        .first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_default();

    let logical_core_count = system.cpus().len();
    let physical_core_count = System::physical_core_count()
        .unwrap_or(logical_core_count)
        .max(1);

    HardwareProfile {
        total_memory_bytes: system.total_memory(),
        available_memory_bytes: system.available_memory(),
        physical_core_count,
        logical_core_count: logical_core_count.max(1),
        cpu_brand,
    }
}

/// CPU instruction-set extensions relevant to llama.cpp's CPU kernel
/// selection. Not an exhaustive CPUID dump — just the extensions that
/// materially change which GGML kernel path is fastest, per
/// `docs/adr/0002-rust-primary-systems-language.md`'s open CPU-ISA
/// dispatch item.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CpuCapabilities {
    /// AVX2 — the safe floor this project assumes is present (ADR-0002).
    pub avx2: bool,
    /// AVX-512 (foundation subset) — present on some but not most of the
    /// competition's reference hardware range.
    pub avx512f: bool,
    /// FMA3 (fused multiply-add) — nearly universal alongside AVX2 but
    /// checked independently since it's architecturally a separate flag.
    pub fma: bool,
}

/// Detects the running CPU's relevant instruction-set support.
///
/// Uses `std::is_x86_feature_detected!`, which performs a real runtime
/// CPUID check on x86/x86_64 — not a compile-time assumption about the
/// build target. On non-x86 architectures (e.g. a contributor running
/// this on Apple Silicon under an ARM Linux VM), every flag is reported
/// `false` rather than failing to compile, since none of these x86-specific
/// extensions exist there; this is correct behavior; ARM is not this
/// project's target platform (Ubuntu x86_64, per ADR-0001/ADR-0007) but
/// the Runtime should still build and run its non-inference logic
/// portably for contributors developing on other hardware.
#[must_use]
pub fn detect_cpu_capabilities() -> CpuCapabilities {
    #[cfg(target_arch = "x86_64")]
    {
        CpuCapabilities {
            avx2: std::is_x86_feature_detected!("avx2"),
            avx512f: std::is_x86_feature_detected!("avx512f"),
            fma: std::is_x86_feature_detected!("fma"),
        }
    }
    #[cfg(not(target_arch = "x86_64"))]
    {
        CpuCapabilities {
            avx2: false,
            avx512f: false,
            fma: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_hardware_reports_nonzero_memory_and_cores_on_a_real_machine() {
        let profile = detect_hardware();
        assert!(
            profile.total_memory_bytes > 0,
            "a real machine always has some RAM"
        );
        assert!(profile.logical_core_count >= 1);
        assert!(profile.physical_core_count >= 1);
        assert!(profile.physical_core_count <= profile.logical_core_count);
    }

    #[test]
    fn detect_hardware_available_memory_does_not_exceed_total() {
        let profile = detect_hardware();
        assert!(profile.available_memory_bytes <= profile.total_memory_bytes);
    }

    #[test]
    fn detect_cpu_capabilities_does_not_panic() {
        // The actual flag values depend on the machine running the test
        // (CI runners and contributor machines will differ), so this
        // test asserts the function runs cleanly and returns a
        // deterministic-per-machine result, not any specific flag value.
        let first = detect_cpu_capabilities();
        let second = detect_cpu_capabilities();
        assert_eq!(
            first, second,
            "capability detection must be deterministic per machine"
        );
    }
}
