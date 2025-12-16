# Chore: ADW Directory Documentation

## Chore Description
Comprehensively document the AI Developer Workflow (ADW) directory by reading all Python files and updating the README with accurate, detailed information about how the system works. The goal is to ensure the README serves as a complete and accurate reference for understanding, using, and troubleshooting the ADW system.

This chore involves:
1. Reading and analyzing all 8 Python files in the adws/ directory
2. Verifying that the existing README documentation is accurate and complete
3. Identifying gaps, outdated information, or areas that need clarification
4. Updating the README with any missing implementation details
5. Ensuring code examples and references are correct and helpful

## Relevant Files
Use these files to complete the chore:

- `adws/README.md` - Main documentation file to be updated
  - Already contains extensive documentation
  - Needs verification against actual code
  - May need additional clarifications or corrections

- `adws/utils.py` - Utility functions (79 lines)
  - Contains `make_adw_id()` for generating unique 8-character workflow IDs
  - Contains `setup_logger()` for dual logging (console + file)
  - Implements logging infrastructure with DEBUG and INFO levels

- `adws/data_types.py` - Pydantic data models (144 lines)
  - Defines all type-safe models for GitHub data (User, Label, Comment, Issue)
  - Defines agent request/response models
  - Defines slash command types with Literal typing
  - Provides JSON serialization and validation

- `adws/github.py` - GitHub operations wrapper (281 lines)
  - Wraps GitHub CLI (gh) commands for fetching issues, posting comments
  - Handles repository URL extraction from git remote
  - Manages GitHub authentication via GITHUB_PAT or gh auth
  - Implements issue status management (labels, assignments)

- `adws/agent.py` - Claude Code CLI integration (263 lines)
  - Executes Claude Code CLI with prompts
  - Manages environment variables for secure execution
  - Parses JSONL output from Claude Code
  - Handles prompt logging and output file management
  - Provides `execute_template()` for slash command execution

- `adws/adw_plan_build.py` - Main workflow orchestration (546 lines)
  - Orchestrates complete ADW workflow from issue to PR
  - Implements 10 workflow phases:
    1. Initialization and validation
    2. Issue classification
    3. Branch creation
    4. Plan generation
    5. Plan file extraction
    6. Plan commit
    7. Implementation
    8. Implementation commit
    9. Pull request creation
    10. Completion and cleanup
  - Uses specialized agents for each phase
  - Implements error handling and GitHub comment notifications

- `adws/health_check.py` - System health validation (397 lines)
  - Validates environment variables (required and optional)
  - Checks git repository configuration
  - Tests GitHub CLI installation and authentication
  - Tests Claude Code CLI functionality with test prompt
  - Returns structured JSON results
  - Can post results to GitHub issues

- `adws/trigger_cron.py` - Polling-based trigger (224 lines)
  - Polls GitHub every 20 seconds for qualifying issues
  - Processes new issues without comments
  - Processes issues with "adw" comment
  - Tracks processed issues in session
  - Launches adw_plan_build.py as subprocess
  - Implements graceful shutdown handlers

- `adws/trigger_webhook.py` - Event-driven webhook server (207 lines)
  - FastAPI server receiving GitHub webhook events
  - Handles "issues.opened" and "issue_comment.created" events
  - Launches workflows in background to meet GitHub's 10s timeout
  - Provides /health endpoint that runs health_check.py
  - Returns immediately with ADW ID and log paths

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Analyze Core Infrastructure Files
- Read `utils.py` to understand ADW ID generation and logging setup
  - Verify README accurately documents the 8-character UUID format
  - Verify README accurately describes dual logging system (console + file)
  - Check if logging levels (DEBUG file, INFO console) are documented
  - Note any implementation details not mentioned in README
- Read `data_types.py` to understand type system
  - Verify all Pydantic models are mentioned in README
  - Check if slash command types are accurately listed
  - Verify JSON serialization capabilities are documented
  - Note any models or types missing from README

### 2. Read and Analyze GitHub Integration
- Read `github.py` to understand GitHub operations
  - Verify README accurately documents GitHub CLI wrapper functions
  - Check authentication methods (GITHUB_PAT vs gh auth) are explained
  - Verify repository URL extraction is documented
  - Check if issue operations are fully described
  - Note any functions or features missing from README
  - Verify environment handling is accurately described

### 3. Read and Analyze Agent System
- Read `agent.py` to understand Claude Code integration
  - Verify README accurately documents JSONL parsing logic
  - Check if environment variable filtering is explained
  - Verify prompt logging mechanism is documented
  - Check if execute_template() workflow is described
  - Verify output file structure is accurately documented
  - Note any implementation details missing from README

### 4. Read and Analyze Main Workflow Orchestration
- Read `adw_plan_build.py` to understand complete workflow
  - Verify all 10 workflow phases are documented in README
  - Check if agent names (AGENT_PLANNER, AGENT_IMPLEMENTOR, etc.) are mentioned
  - Verify error handling with check_error() is described
  - Check if format_issue_message() pattern is documented
  - Verify command-line argument parsing is explained
  - Note any workflow steps missing or inaccurately described in README
  - Check if line number references in README are still accurate

### 5. Read and Analyze Health Check System
- Read `health_check.py` to understand validation logic
  - Verify README documents all health checks performed
  - Check if CheckResult and HealthCheckResult models are mentioned
  - Verify test prompt ("What is 2+2?") approach is documented
  - Check if optional vs required env vars distinction is clear
  - Verify health check integration with webhook is documented
  - Note any checks or features missing from README

### 6. Read and Analyze Trigger Mechanisms
- Read `trigger_cron.py` to understand polling system
  - Verify 20-second polling interval is documented
  - Check if issue qualification logic is accurately described
  - Verify session tracking (processed_issues, issue_last_comment) is mentioned
  - Check if graceful shutdown is documented
  - Note any implementation details missing from README
- Read `trigger_webhook.py` to understand webhook system
  - Verify FastAPI endpoints (/gh-webhook, /health) are documented
  - Check if event types (issues.opened, issue_comment.created) are listed
  - Verify background process launching is explained
  - Check if immediate return behavior is documented
  - Verify integration with health_check.py is described
  - Note any webhook features missing from README

### 7. Compare Code with Existing README Documentation
- Create a list of discrepancies between code and README
  - Identify outdated line number references
  - Note missing functions or features
  - Identify incorrect descriptions
  - Note areas that could be clearer
- Create a list of documentation gaps
  - Features not mentioned in README
  - Important implementation details omitted
  - Helpful examples that could be added
  - Troubleshooting scenarios not covered

### 8. Update README with Improvements
- Fix any inaccurate information
  - Update line number references if changed
  - Correct function names or descriptions
  - Fix command examples if outdated
- Add missing information
  - Document any undocumented functions or features
  - Add important implementation details
  - Include helpful examples
  - Add troubleshooting guidance
- Improve clarity where needed
  - Simplify complex explanations
  - Add examples for difficult concepts
  - Reorganize sections if flow is unclear
  - Add cross-references between related sections
- Ensure consistency
  - Verify terminology is consistent throughout
  - Check that code examples follow same style
  - Ensure section formatting is uniform

### 9. Add or Improve Documentation Sections
- Consider adding a "Quick Reference" section for common operations
- Consider adding a "Troubleshooting Guide" section with common errors
- Consider adding an "Architecture Diagram" section (ASCII art) if helpful
- Consider adding a "Development Guide" for contributors
- Ensure all environment variables are documented with their purpose
- Ensure all slash commands are listed with descriptions

### 10. Run Validation Commands
- Execute validation commands to ensure documentation is accurate
- Verify the ADW system is functional after documentation updates

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `uv run adws/health_check.py` - Run health check to verify ADW system is properly configured and functional
- `cd adws && python3 -c "import utils; import data_types; import github; import agent; import adw_plan_build; import health_check; import trigger_cron; import trigger_webhook; print('All modules import successfully')"` - Verify all Python modules can be imported without errors
- `cat adws/README.md | grep -E "^#" | head -20` - Verify README has proper heading structure

## Notes
- The README already contains extensive documentation (~895 lines), so this is primarily a verification and enhancement task
- Focus on accuracy over adding unnecessary content
- Code references with line numbers (e.g., "adw_plan_build.py:367-542") should be verified and updated if needed
- The documentation should serve both new users and developers troubleshooting issues
- Examples should be practical and reflect actual usage patterns
- Consider the audience: developers who need to understand, use, or extend the system
- Maintain the existing documentation structure and style for consistency
- All 8 Python files are in the adws/ directory (not a subdirectory)
- The health check script is the best validation that documentation reflects a working system
