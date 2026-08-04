//! Thread Scheduler: decides how many CPU threads the inference worker
//! should use for generation, based on the host's detected hardware.

use super::hardware::HardwareProfile;

/// Recommends a thread count for llama.cpp generation, given a detected
/// [`HardwareProfile`].
///
/// Leaves one physical core free for the OS, the UI event loop, and the
/// Runtime Manager's own IPC handling — using every physical core for
/// inference threads is a common cause of a desktop feeling
/// unresponsive during generation, which directly works against the
/// "user experience" optimization goal alongside throughput. This is a
/// deliberate trade, not an oversight: pure throughput benchmarks should
/// account for it rather than being surprised by it (see
/// `docs/benchmarks/`).
///
/// Always returns at least `1`, even on a single-core host.
#[must_use]
pub fn recommended_thread_count(hardware: &HardwareProfile) -> i32 {
    let threads = hardware.physical_core_count.saturating_sub(1).max(1);
    i32::try_from(threads).unwrap_or(1)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hardware_with_physical_cores(count: usize) -> HardwareProfile {
        HardwareProfile {
            total_memory_bytes: 8 * 1024 * 1024 * 1024,
            available_memory_bytes: 4 * 1024 * 1024 * 1024,
            physical_core_count: count,
            logical_core_count: count * 2,
            cpu_brand: "test-cpu".to_string(),
        }
    }

    #[test]
    fn leaves_one_core_free_on_a_multi_core_machine() {
        assert_eq!(
            recommended_thread_count(&hardware_with_physical_cores(4)),
            3
        );
        assert_eq!(
            recommended_thread_count(&hardware_with_physical_cores(8)),
            7
        );
    }

    #[test]
    fn never_recommends_zero_threads_on_a_single_core_machine() {
        assert_eq!(
            recommended_thread_count(&hardware_with_physical_cores(1)),
            1
        );
    }
}
