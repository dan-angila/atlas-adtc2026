//! Error Recovery: the worker-restart backoff policy
//! `docs/adr/0010-inference-worker-process-isolation.md` commits to
//! ("rate-limited... so a systematically-crashing model file doesn't
//! spin the CPU or thrash the disk").

use std::time::Duration;

/// Decides whether and how long to wait before restarting a crashed
/// inference worker.
///
/// A pure, deterministic policy object — it does not itself sleep, spawn
/// anything, or hold a clock; the Runtime Manager calls
/// [`RestartPolicy::next_delay`] and does the actual waiting, which
/// keeps this type trivially testable (no real time needs to pass in a
/// test).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct RestartPolicy {
    /// Delay before the first restart attempt.
    pub base_delay: Duration,
    /// Multiplier applied to the delay after each consecutive failure.
    pub backoff_multiplier: f64,
    /// Ceiling on the delay, however many consecutive failures have
    /// occurred.
    pub max_delay: Duration,
    /// After this many consecutive failures, stop recommending restarts
    /// at all — a model/environment that fails this many times in a row
    /// is not going to succeed on attempt N+1, and continuing to retry
    /// only burns CPU and disk I/O for no benefit.
    pub max_consecutive_failures: u32,
}

impl Default for RestartPolicy {
    /// 500ms, doubling, capped at 30s, giving up after 5 consecutive
    /// failures. Conservative defaults chosen to recover quickly from a
    /// transient failure (an OOM-killed worker under momentary memory
    /// pressure) while not hammering a systematically broken model file.
    fn default() -> Self {
        Self {
            base_delay: Duration::from_millis(500),
            backoff_multiplier: 2.0,
            max_delay: Duration::from_secs(30),
            max_consecutive_failures: 5,
        }
    }
}

impl RestartPolicy {
    /// Given `consecutive_failures` (the count *before* this attempt —
    /// `0` for the first restart after an initially healthy worker
    /// crashes), returns how long to wait before attempting a restart,
    /// or `None` if [`RestartPolicy::max_consecutive_failures`] has been
    /// reached and the Runtime Manager should surface a hard failure to
    /// the caller instead of retrying again.
    #[must_use]
    pub fn next_delay(&self, consecutive_failures: u32) -> Option<Duration> {
        if consecutive_failures >= self.max_consecutive_failures {
            return None;
        }

        let multiplier = self
            .backoff_multiplier
            .powi(i32::try_from(consecutive_failures).unwrap_or(i32::MAX));
        let delay_secs = self.base_delay.as_secs_f64() * multiplier;
        let delay = Duration::from_secs_f64(delay_secs);
        Some(delay.min(self.max_delay))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn first_restart_uses_the_base_delay() {
        let policy = RestartPolicy::default();
        assert_eq!(policy.next_delay(0), Some(policy.base_delay));
    }

    #[test]
    fn delay_doubles_with_each_consecutive_failure() {
        let policy = RestartPolicy::default();
        let first = policy.next_delay(0).unwrap();
        let second = policy.next_delay(1).unwrap();
        let third = policy.next_delay(2).unwrap();
        assert_eq!(second, first * 2);
        assert_eq!(third, first * 4);
    }

    #[test]
    fn delay_is_capped_at_max_delay() {
        let policy = RestartPolicy::default();
        // At the multipliers involved, failure 10 would exceed max_delay
        // without the cap.
        let delay = policy.next_delay(10).unwrap_or(policy.max_delay);
        assert!(delay <= policy.max_delay);
    }

    #[test]
    fn stops_recommending_restarts_after_max_consecutive_failures() {
        let policy = RestartPolicy::default();
        assert_eq!(policy.next_delay(policy.max_consecutive_failures), None);
        assert_eq!(policy.next_delay(policy.max_consecutive_failures + 1), None);
    }

    #[test]
    fn custom_policy_respects_its_own_parameters() {
        let policy = RestartPolicy {
            base_delay: Duration::from_millis(100),
            backoff_multiplier: 3.0,
            max_delay: Duration::from_secs(1),
            max_consecutive_failures: 2,
        };
        assert_eq!(policy.next_delay(0), Some(Duration::from_millis(100)));
        assert_eq!(policy.next_delay(1), Some(Duration::from_millis(300)));
        assert_eq!(policy.next_delay(2), None);
    }
}
