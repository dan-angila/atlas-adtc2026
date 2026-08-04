//! Context Manager: context-window budget tracking.
//!
//! This is a **pre-flight budget check**, not a tokenizer. The
//! authoritative token count for any given prompt comes back from
//! `atlas-inference-worker` after llama.cpp's real tokenizer runs
//! (`atlas_ipc::GenerationStats::prompt_tokens`) — that number is exact.
//! What this module provides is a cheap, main-process-side *estimate*
//! usable before a request is ever sent to the worker, so a caller can
//! avoid submitting a prompt that obviously won't fit rather than
//! discovering that only after paying for an IPC round trip and a
//! worker-side failure.
//!
//! The estimate is deliberately documented as approximate — reporting it
//! as exact would be exactly the kind of fabricated-precision the
//! project's "no fake benchmarking" standard rules out.

/// A context window's token budget, split between the prompt and the
/// space reserved for the model's response.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ContextBudget {
    /// Total context window size, in tokens.
    pub max_tokens: u32,
    /// Tokens reserved for the response (not available to the prompt).
    pub reserved_for_response: u32,
}

impl ContextBudget {
    /// Tokens available for the prompt, after reserving space for the
    /// response.
    #[must_use]
    pub fn available_for_prompt(&self) -> u32 {
        self.max_tokens.saturating_sub(self.reserved_for_response)
    }
}

/// Estimates the token count of `text` using a documented heuristic
/// (~4 characters per token, the commonly cited rule of thumb for
/// English-like text across most modern BPE tokenizers) — **not** an
/// exact count. See the module-level documentation for why this is
/// intentional rather than a shortcut.
#[must_use]
pub fn estimate_token_count(text: &str) -> u32 {
    if text.is_empty() {
        return 0;
    }
    let char_count = u32::try_from(text.chars().count()).unwrap_or(u32::MAX);
    (char_count.div_ceil(4)).max(1)
}

/// Tracks whether a given prompt fits a [`ContextBudget`], using the
/// approximate token estimate.
#[derive(Debug, Clone, Copy)]
pub struct ContextManager {
    budget: ContextBudget,
}

impl ContextManager {
    /// Creates a manager for the given budget.
    #[must_use]
    pub fn new(budget: ContextBudget) -> Self {
        Self { budget }
    }

    /// The budget this manager was constructed with.
    #[must_use]
    pub fn budget(&self) -> ContextBudget {
        self.budget
    }

    /// Whether `prompt`'s estimated token count fits within the
    /// available prompt budget.
    #[must_use]
    pub fn fits_within_budget(&self, prompt: &str) -> bool {
        estimate_token_count(prompt) <= self.budget.available_for_prompt()
    }

    /// Estimated tokens remaining in the prompt budget after accounting
    /// for `prompt`. Negative if `prompt` is estimated to exceed the
    /// budget.
    #[must_use]
    pub fn remaining_budget(&self, prompt: &str) -> i64 {
        i64::from(self.budget.available_for_prompt()) - i64::from(estimate_token_count(prompt))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_string_estimates_zero_tokens() {
        assert_eq!(estimate_token_count(""), 0);
    }

    #[test]
    fn short_nonempty_string_estimates_at_least_one_token() {
        assert_eq!(estimate_token_count("a"), 1);
    }

    #[test]
    fn estimate_scales_roughly_with_length() {
        let short = estimate_token_count("hello");
        let long = estimate_token_count(&"hello world ".repeat(20));
        assert!(long > short * 10);
    }

    #[test]
    fn available_for_prompt_subtracts_reserved_space() {
        let budget = ContextBudget {
            max_tokens: 4096,
            reserved_for_response: 512,
        };
        assert_eq!(budget.available_for_prompt(), 3584);
    }

    #[test]
    fn available_for_prompt_never_underflows_when_reservation_exceeds_max() {
        let budget = ContextBudget {
            max_tokens: 100,
            reserved_for_response: 200,
        };
        assert_eq!(budget.available_for_prompt(), 0);
    }

    #[test]
    fn fits_within_budget_accepts_a_short_prompt_and_rejects_a_huge_one() {
        let manager = ContextManager::new(ContextBudget {
            max_tokens: 100,
            reserved_for_response: 20,
        });
        assert!(manager.fits_within_budget("a short prompt"));

        let huge_prompt = "word ".repeat(1000);
        assert!(!manager.fits_within_budget(&huge_prompt));
    }

    #[test]
    fn remaining_budget_can_go_negative_for_an_oversized_prompt() {
        let manager = ContextManager::new(ContextBudget {
            max_tokens: 10,
            reserved_for_response: 0,
        });
        let remaining = manager.remaining_budget(&"word ".repeat(100));
        assert!(remaining < 0);
    }
}
