# AI Developer Workflow (ADW) System

ADW automates software development by integrating GitHub issues with Claude Code CLI to classify issues, generate plans, implement solutions, and create pull requests.

## Quick Start

### 1. Set Environment Variables

```bash
export GITHUB_REPO_URL="https://github.com/owner/repository"
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export CLAUDE_CODE_PATH="/path/to/claude"  # Optional, defaults to "claude"
export GITHUB_PAT="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Optional, only if using different account than 'gh auth login'
```

### 2. Install Prerequisites

```bash
# GitHub CLI
brew install gh              # macOS
# or: sudo apt install gh    # Ubuntu/Debian
# or: winget install --id GitHub.cli  # Windows

# Claude Code CLI
# Follow instructions at https://docs.anthropic.com/en/docs/claude-code

# Python dependency manager (uv)
curl -LsSf https://astral.sh/uv/install.sh | sh  # macOS/Linux
# or: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"  # Windows

# Authenticate GitHub
gh auth login
```

### 3. Run ADW

```bash
cd adws/

# Process a single issue manually
uv run adw_plan_build.py 123

# Run continuous monitoring (polls every 20 seconds)
uv run trigger_cron.py

# Start webhook server (for instant GitHub events)
uv run trigger_webhook.py
```

## Script Usage Guide

### adw_plan_build.py - Process Single Issue

Executes the complete ADW workflow for a specific GitHub issue.

```bash
# Basic usage
uv run adw_plan_build.py 456

# What it does:
# 1. Fetches issue #456 from GitHub
# 2. Creates feature branch
# 3. Classifies issue type (/chore, /bug, /feature)
# 4. Generates implementation plan
# 5. Implements the solution
# 6. Creates commits and pull request
```

**Example output:**
```
ADW ID: e5f6g7h8
issue_command: /feature
Working on branch: feat-456-e5f6g7h8-add-user-authentication
plan_file_path: specs/add-user-authentication-system-plan.md
Pull request created: https://github.com/owner/repo/pull/789
```

### trigger_cron.py - Automated Monitoring

Continuously monitors GitHub for new issues or "adw" comments.

```bash
# Start monitoring
uv run trigger_cron.py

# Processes issues when:
# - New issue has no comments
# - Latest comment on any issue is exactly "adw"

# Example log output:
# 2024-01-15 10:30:45 - Starting ADW cron trigger
# 2024-01-15 10:30:46 - Issue #123 has no comments - processing
# 2024-01-15 10:30:47 - Issue #456 - latest comment is 'adw' - processing
```

**Production deployment with systemd:**
```bash
# Create service file: /etc/systemd/system/adw-cron.service
sudo systemctl enable adw-cron
sudo systemctl start adw-cron
```

### trigger_webhook.py - GitHub Webhook Server

Receives real-time GitHub events for instant processing.

```bash
# Start webhook server (default port 8001)
uv run trigger_webhook.py

# Custom port
PORT=3000 uv run trigger_webhook.py

# Configure GitHub webhook:
# URL: https://your-server.com/gh-webhook
# Events: Issues, Issue comments
```

**Endpoints:**
- `/gh-webhook` - Receives GitHub events
- `/health` - Health check endpoint

## How ADW Works

1. **Issue Classification**: Analyzes GitHub issue and determines type:
   - `/chore` - Maintenance, documentation, refactoring
   - `/bug` - Bug fixes and corrections
   - `/feature` - New features and enhancements

2. **Planning**: `sdlc_planner` agent creates implementation plan with:
   - Technical approach
   - Step-by-step tasks
   - File modifications
   - Testing requirements

3. **Implementation**: `sdlc_implementor` agent executes the plan:
   - Analyzes codebase
   - Implements changes
   - Runs tests
   - Ensures quality

4. **Integration**: Creates git commits and pull request:
   - Semantic commit messages
   - Links to original issue
   - Implementation summary

## How ADW Works - Technical Details

### System Architecture

ADW is a multi-agent autonomous software development system built on three core layers:

**Layer 1: Trigger Systems**
- Manual execution via `adw_plan_build.py`
- Polling-based monitoring via `trigger_cron.py` (20-second intervals)
- Event-driven webhooks via `trigger_webhook.py` (FastAPI server)

**Layer 2: Workflow Orchestration**
The `adw_plan_build.py` script coordinates all workflow phases and manages:
- Issue qualification and validation
- Agent lifecycle and execution
- GitHub operations (comments, commits, PRs)
- Error handling and recovery
- Workflow tracking via unique ADW IDs

**Layer 3: Agent System**
Specialized agents execute discrete tasks through Claude Code CLI:
- `issue_classifier` - Analyzes issues and determines type (/chore, /bug, /feature)
- `sdlc_planner` - Generates comprehensive implementation plans
- `plan_finder` - Extracts plan file paths from agent output
- `branch_generator` - Creates semantic branch names
- `sdlc_implementor` - Implements the plan by reading, editing, and creating files
- `committer` (suffix variants) - Generates properly formatted commit messages
- `pr_creator` - Creates pull requests with full context

**Layer 4: Integration Layer**
- `agent.py` - Bridges Python workflow with Claude Code CLI
- `github.py` - Wraps GitHub CLI (gh) operations
- `data_types.py` - Enforces type safety with Pydantic models
- `utils.py` - Provides ADW ID generation and logging infrastructure

### Workflow Phases and Data Flow

The complete ADW workflow follows this sequence (adw_plan_build.py:367-542):

```
GitHub Issue → ADW Workflow → Pull Request
```

**Phase 1: Initialization and Validation**
1. Parse command-line arguments (issue number, optional ADW ID)
2. Generate 8-character ADW ID for tracking (utils.py:10-12)
3. Set up dual logging (console + file at agents/{adw_id}/adw_plan_build/execution.log)
4. Validate environment variables (ANTHROPIC_API_KEY, CLAUDE_CODE_PATH)
5. Extract repository information from git remote
6. Fetch full issue details via GitHub CLI

**Phase 2: Issue Classification** (adw_plan_build.py:114-158)
```
Issue JSON → issue_classifier agent → Slash Command (/chore, /bug, /feature)
```
- Constructs AgentTemplateRequest with issue JSON
- Executes `/classify_issue` slash command via Claude Code
- Parses JSONL output to extract classification
- Posts classification result to issue as comment
- Handles invalid responses with error reporting

**Phase 3: Branch Creation** (adw_plan_build.py:241-268)
```
Issue + Classification → branch_generator agent → Git Branch
```
- Generates semantic branch name: `{type}-{number}-{adw_id}-{slug}`
- Example: `feature-42-a1b2c3d4-add-user-authentication`
- Creates and checks out branch
- Posts branch name to issue

**Phase 4: Plan Generation** (adw_plan_build.py:160-183)
```
Issue Details → sdlc_planner agent → Implementation Plan (Markdown)
```
- Executes classification-specific slash command (/chore, /bug, /feature)
- Provides issue title and body as arguments
- Agent analyzes requirements and generates plan file in specs/
- Plan includes: description, relevant files, step-by-step tasks, validation commands
- Output stored in agents/{adw_id}/sdlc_planner/raw_output.jsonl

**Phase 5: Plan File Extraction** (adw_plan_build.py:185-214)
```
Planner Output → plan_finder agent → Plan File Path
```
- Parses planner's natural language output
- Extracts file path to generated plan (e.g., specs/feature-name-plan.md)
- Validates path format and existence
- Returns cleaned absolute or relative path

**Phase 6: Plan Commit** (adw_plan_build.py:270-301)
```
Plan Changes → committer agent → Git Commit
```
- Generates semantic commit message via `/commit` slash command
- Format: `{type}: {description} for #{issue_number}`
- Uses unique agent name: `{agent_name}_committer` to avoid output collision
- Adds ADW tracking footer with ID and Claude Code attribution
- Creates git commit with generated message

**Phase 7: Implementation** (adw_plan_build.py:216-238)
```
Plan File → sdlc_implementor agent → Code Changes
```
- Executes `/implement` slash command with plan file path
- Agent reads plan, analyzes codebase, and implements changes
- Performs file operations: Read, Edit, Write, Bash
- Runs validation commands specified in plan
- Reports implementation summary
- Output stored in agents/{adw_id}/sdlc_implementor/raw_output.jsonl

**Phase 8: Implementation Commit** (same process as Phase 6)
```
Implementation Changes → committer agent → Git Commit
```
- Generates commit message for implementation
- Creates second commit with all implementation changes

**Phase 9: Pull Request Creation** (adw_plan_build.py:303-328)
```
Branch + Issue + Plan → pr_creator agent → GitHub PR
```
- Executes `/pull_request` slash command
- Provides: branch name, issue JSON, plan file path, ADW ID
- Generates PR title and comprehensive body with:
  - Summary of changes
  - Link to original issue
  - Implementation details from plan
  - Test plan and validation steps
- Creates PR via GitHub CLI
- Returns PR URL

**Phase 10: Completion**
- Posts final success message to issue
- Logs completion with ADW ID
- Exit with status code 0

**Error Handling Throughout**
Every phase includes error checking via check_error() function (adw_plan_build.py:330-364):
- Validates agent response success status
- Posts error messages as issue comments with ADW ID tracking
- Logs detailed error information
- Exits with non-zero status on failure

### Agent System and Claude Code Integration

The agent system bridges Python orchestration with Claude Code CLI's autonomous capabilities.

**Agent Execution Flow** (agent.py:238-262)

```python
AgentTemplateRequest → execute_template() → AgentPromptResponse
```

1. **Request Construction**
   - `agent_name`: Identifies agent for logging/tracking
   - `slash_command`: The custom command to execute (e.g., /classify_issue)
   - `args`: List of string arguments passed to command
   - `adw_id`: Workflow tracking ID
   - `model`: "sonnet" (fast, default) or "opus" (powerful)

2. **Output Directory Setup**
   - Creates: `agents/{adw_id}/{agent_name}/`
   - Output file: `raw_output.jsonl`
   - Prompt file: `prompts/{command_name}.txt`

3. **Prompt Construction**
   - Combines slash command with arguments: `{slash_command} {arg1} {arg2} ...`
   - Example: `/classify_issue {"number": 42, "title": "Add auth", ...}`

4. **Claude Code CLI Execution** (agent.py:156-236)
   ```bash
   claude -p "{prompt}" \
     --model {model} \
     --output-format stream-json \
     --verbose \
     --dangerously-skip-permissions
   ```

5. **Environment Configuration** (agent.py:84-129)
   - Filters environment to only required variables
   - Includes: ANTHROPIC_API_KEY, PATH, HOME, USER, SHELL, TERM
   - Conditionally adds GITHUB_PAT as GH_TOKEN if provided
   - Omits all other environment variables for security

6. **Output Processing**
   - JSONL output piped to `raw_output.jsonl`
   - Parsed line-by-line to find result message (type: "result")
   - Extracts: session_id, result text, is_error flag
   - Converts JSONL to JSON array in `raw_output.json`

7. **Response Handling**
   - Success: Returns result text and session_id
   - Failure: Returns error message with success=False
   - Timeout: Returns timeout error after 5 minutes

**JSONL Output Format**

Claude Code outputs structured JSONL with message types:
```json
{"type": "text", "text": "Analyzing issue..."}
{"type": "tool_use", "tool": "Read", "parameters": {...}}
{"type": "tool_result", "tool": "Read", "output": "..."}
{"type": "result", "session_id": "abc123", "is_error": false, "result": "/feature", "total_cost_usd": 0.05, ...}
```

The final "result" message contains:
- `session_id`: Unique session identifier
- `is_error`: Boolean indicating success/failure
- `result`: The agent's final output (plan path, branch name, commit message, etc.)
- `duration_ms`: Total execution time
- `duration_api_ms`: API call time
- `num_turns`: Number of conversation turns
- `total_cost_usd`: API cost for this execution

**Slash Commands**

ADW uses custom slash commands defined in `.claude/commands/`:
- `/classify_issue` - Analyzes issue and returns classification
- `/chore`, `/bug`, `/feature` - Generate type-specific implementation plans
- `/find_plan_file` - Extracts plan file path from text
- `/generate_branch_name` - Creates semantic branch name
- `/commit` - Generates conventional commit message
- `/implement` - Executes implementation plan
- `/pull_request` - Creates GitHub pull request

Each slash command is a markdown file containing:
- Instructions for Claude
- Expected input format
- Output format requirements
- Context about the ADW workflow

### Trigger Mechanisms

ADW supports three trigger mechanisms for different use cases:

**1. Manual Execution** (`adw_plan_build.py`)

Direct command-line invocation for processing specific issues:

```bash
uv run adw_plan_build.py <issue_number> [adw_id]
```

- **Use case**: Development, testing, manual intervention
- **Advantages**: Full control, immediate execution, debug visibility
- **Limitations**: No automation, requires manual monitoring

**2. Polling-Based Monitoring** (`trigger_cron.py`)

Automated monitoring via scheduled polling (every 20 seconds):

```bash
uv run trigger_cron.py
```

**Issue Qualification Logic** (trigger_cron.py:64-91):
- Fetches all open issues from repository
- Processes issue if:
  - Issue has no comments (new issue)
  - Latest comment body is exactly "adw" (case-insensitive, trimmed)
- Tracks processed issues in session to avoid duplicates
- Tracks last processed comment ID per issue to detect new "adw" comments

**Workflow Triggering** (trigger_cron.py:94-122):
- Spawns subprocess: `python adw_plan_build.py {issue_number}`
- Runs from project root directory
- Captures output and logs results
- Continues processing other issues on failure

**Features**:
- Graceful shutdown via SIGINT/SIGTERM handlers
- Session-based tracking of processed issues
- Performance metrics (cycle time, processed count)
- Automatic retry on transient failures

**Use case**: Continuous integration, low-traffic repositories
**Advantages**: Simple setup, no external dependencies, reliable
**Limitations**: 20-second delay, inefficient polling, higher API usage

**3. Event-Driven Webhooks** (`trigger_webhook.py`)

Real-time processing via GitHub webhook events:

```bash
uv run trigger_webhook.py
# Server starts on port 8001 (configurable via PORT env var)
```

**Endpoint**: `POST /gh-webhook`

**Supported Events**:
- `issues.opened` - New issue created
- `issue_comment.created` - Comment added to issue

**Event Processing** (trigger_webhook.py:40-122):
```python
if event == "issues" and action == "opened":
    trigger_workflow(issue_number, adw_id)
elif event == "issue_comment" and action == "created":
    if comment_body.strip().lower() == "adw":
        trigger_workflow(issue_number, adw_id)
```

**Background Execution**:
- Generates unique ADW ID for tracking
- Launches `adw_plan_build.py` via subprocess.Popen()
- Returns immediately to meet GitHub's 10-second timeout
- Workflow continues in background, logs to agents/{adw_id}/

**Health Check Endpoint**: `GET /health`
- Executes health_check.py script
- Returns comprehensive system status
- Validates environment, git, GitHub CLI, Claude Code
- Used for monitoring and alerting

**Use case**: Production deployments, high-traffic repositories
**Advantages**: Instant response, efficient, scalable
**Limitations**: Requires public endpoint, webhook configuration

**Webhook Setup**:
1. Expose endpoint publicly (Cloudflare Tunnel, ngrok, or VPS)
2. Configure webhook in GitHub repository settings:
   - URL: `https://your-domain.com/gh-webhook`
   - Content type: `application/json`
   - Events: Issues, Issue comments
   - Active: Yes

### Data Models and Type System

ADW enforces type safety throughout using Pydantic models (data_types.py).

**GitHub Data Models**

```python
class GitHubUser(BaseModel):
    id: Optional[str]
    login: str
    name: Optional[str]
    is_bot: bool = False

class GitHubLabel(BaseModel):
    id: str
    name: str
    color: str
    description: Optional[str]

class GitHubComment(BaseModel):
    id: str
    author: GitHubUser
    body: str
    created_at: datetime
    updated_at: Optional[datetime]

class GitHubIssue(BaseModel):
    number: int
    title: str
    body: str
    state: str
    author: GitHubUser
    assignees: List[GitHubUser]
    labels: List[GitHubLabel]
    comments: List[GitHubComment]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]
    url: str
```

These models parse GitHub CLI JSON output and provide:
- Type checking and validation
- Automatic datetime parsing
- Field aliases for camelCase to snake_case conversion
- JSON serialization for passing to agents

**Agent Request Models**

```python
class AgentPromptRequest(BaseModel):
    prompt: str
    adw_id: str
    agent_name: str = "ops"
    model: Literal["sonnet", "opus"] = "opus"
    dangerously_skip_permissions: bool = False
    output_file: str

class AgentTemplateRequest(BaseModel):
    agent_name: str
    slash_command: SlashCommand
    args: List[str]
    adw_id: str
    model: Literal["sonnet", "opus"] = "sonnet"
```

**Agent Response Models**

```python
class AgentPromptResponse(BaseModel):
    output: str
    success: bool
    session_id: Optional[str]

class ClaudeCodeResultMessage(BaseModel):
    type: str
    subtype: str
    is_error: bool
    duration_ms: int
    duration_api_ms: int
    num_turns: int
    result: str
    session_id: str
    total_cost_usd: float
```

**Slash Command Types**

```python
IssueClassSlashCommand = Literal["/chore", "/bug", "/feature"]

SlashCommand = Literal[
    "/chore", "/bug", "/feature",
    "/classify_issue", "/find_plan_file",
    "/generate_branch_name", "/commit",
    "/pull_request", "/implement"
]
```

**Type Safety Benefits**:
- Compile-time type checking with mypy
- Runtime validation of API responses
- Auto-completion in IDEs
- Self-documenting code
- Prevention of type-related bugs

### Logging and Tracking

ADW implements comprehensive logging and tracking through a hierarchical system.

**ADW ID System** (utils.py:10-12)

Each workflow execution gets a unique 8-character identifier:
```python
def make_adw_id() -> str:
    return str(uuid.uuid4())[:8]
```

Example: `a1b2c3d4`

**ADW ID Appears In**:
- Issue comments: `a1b2c3d4_ops: ✅ Starting ADW workflow`
- Log files: `agents/a1b2c3d4/adw_plan_build/execution.log`
- Agent output: `agents/a1b2c3d4/sdlc_planner/raw_output.jsonl`
- Git commits: `Generated with ADW ID: a1b2c3d4`
- Pull requests: `ADW ID: a1b2c3d4` in PR body

**Dual Logging System** (utils.py:15-67)

```python
logger = setup_logger(adw_id, "adw_plan_build")
```

Creates two handlers:
1. **File Handler** (DEBUG level)
   - Path: `agents/{adw_id}/adw_plan_build/execution.log`
   - Format: `2024-01-15 10:30:45 - INFO - Starting workflow`
   - Captures everything: DEBUG, INFO, WARNING, ERROR

2. **Console Handler** (INFO level)
   - Format: Simple message without timestamp
   - Shows real-time progress: INFO, WARNING, ERROR
   - Matches current user-facing output style

**Output Directory Structure**

```
agents/
└── a1b2c3d4/                          # ADW ID directory
    ├── adw_plan_build/
    │   └── execution.log              # Main workflow log
    ├── issue_classifier/
    │   ├── prompts/
    │   │   └── classify_issue.txt     # Prompt sent to Claude
    │   ├── raw_output.jsonl           # Streaming JSONL output
    │   └── raw_output.json            # Converted JSON array
    ├── sdlc_planner/
    │   ├── prompts/
    │   │   └── feature.txt
    │   ├── raw_output.jsonl
    │   └── raw_output.json
    ├── plan_finder/
    │   ├── prompts/
    │   │   └── find_plan_file.txt
    │   ├── raw_output.jsonl
    │   └── raw_output.json
    ├── branch_generator/
    │   ├── prompts/
    │   │   └── generate_branch_name.txt
    │   ├── raw_output.jsonl
    │   └── raw_output.json
    ├── sdlc_implementor/
    │   ├── prompts/
    │   │   └── implement.txt
    │   ├── raw_output.jsonl
    │   └── raw_output.json
    └── pr_creator/
        ├── prompts/
        │   └── pull_request.txt
        ├── raw_output.jsonl
        └── raw_output.json
```

**Tracing a Workflow Execution**

1. Find ADW ID from issue comment or PR
2. Navigate to `agents/{adw_id}/`
3. Check main log: `adw_plan_build/execution.log`
4. Review agent outputs: `{agent_name}/raw_output.json`
5. Inspect prompts sent: `{agent_name}/prompts/{command}.txt`

**Prompt Logging** (agent.py:132-153)

Every prompt sent to Claude Code is saved:
```python
save_prompt(prompt, adw_id, agent_name)
# Saves to: agents/{adw_id}/{agent_name}/prompts/{command}.txt
```

Benefits:
- Debug agent behavior
- Reproduce issues
- Understand agent context
- Improve slash command prompts

### Health Check System

ADW includes a comprehensive health check system (health_check.py) that validates the entire environment.

**Health Check Script**

```bash
uv run adws/health_check.py [issue_number]
```

**Checks Performed**:

1. **Environment Variables** (health_check.py:62-101)
   - Required: ANTHROPIC_API_KEY, CLAUDE_CODE_PATH
   - Optional: GITHUB_PAT, E2B_API_KEY, CLOUDFLARED_TUNNEL_TOKEN
   - Reports missing required variables as errors
   - Lists missing optional variables as info (not warnings)

2. **Git Repository Configuration** (health_check.py:104-128)
   - Validates git remote exists
   - Extracts repository path via github.py functions
   - Checks if still using 'disler' repository (warning)
   - Confirms proper fork/clone setup

3. **GitHub CLI** (health_check.py:223-253)
   - Verifies gh CLI is installed
   - Tests authentication status
   - Supports both `gh auth login` and GITHUB_PAT
   - Reports installation and auth status separately

4. **Claude Code CLI Functionality** (health_check.py:131-220)
   - Tests CLI is installed and accessible
   - Executes test prompt: "What is 2+2?"
   - Validates JSONL output parsing
   - Confirms API communication works
   - Reports execution success and response

**Health Check Result Structure**

```python
class CheckResult(BaseModel):
    success: bool
    error: Optional[str]
    warning: Optional[str]
    details: Dict[str, Any]

class HealthCheckResult(BaseModel):
    success: bool
    timestamp: str
    checks: Dict[str, CheckResult]
    warnings: List[str]
    errors: List[str]
```

**Integration with Webhook Server**

The webhook server exposes health checks via GET /health (trigger_webhook.py:125-199):
- Executes health_check.py as subprocess
- Parses output for warnings and errors
- Returns JSON response with status
- Used for monitoring and uptime checks

**Example Output**

```
🏥 Running ADW System Health Check...

✅ Overall Status: HEALTHY
📅 Timestamp: 2024-01-15T10:30:45

📋 Check Results:
--------------------------------------------------

✅ Environment:
   claude_code_path: /usr/local/bin/claude

✅ Git Repository:
   repo_url: https://github.com/user/repo
   repo_path: user/repo

✅ Github Cli:
   installed: True
   authenticated: True

✅ Claude Code:
   test_passed: True
   response: 4
```

**Health Check Use Cases**:
- Pre-deployment validation
- Continuous monitoring
- Troubleshooting setup issues
- Verifying configuration changes
- CI/CD pipeline checks

## Common Usage Scenarios

### Process a bug report
```bash
# User reports bug in issue #789
uv run adw_plan_build.py 789
# ADW analyzes, creates fix, and opens PR
```

### Enable automatic processing
```bash
# Start cron monitoring
uv run trigger_cron.py
# New issues are processed automatically
# Users can comment "adw" to trigger processing
```

### Deploy webhook for instant response
```bash
# Start webhook server
uv run trigger_webhook.py
# Configure in GitHub settings
# Issues processed immediately on creation
```

## Troubleshooting

### Environment Issues
```bash
# Check required variables
env | grep -E "(GITHUB|ANTHROPIC|CLAUDE)"

# Verify GitHub auth
gh auth status

# Test Claude Code
claude --version
```

### Common Errors

**"Claude Code CLI is not installed"**
```bash
which claude  # Check if installed
# Reinstall from https://docs.anthropic.com/en/docs/claude-code
```

**"Missing GITHUB_PAT"** (Optional - only needed if using different account than 'gh auth login')
```bash
export GITHUB_PAT=$(gh auth token)
```

**"Agent execution failed"**
```bash
# Check agent output
cat agents/*/sdlc_planner/raw_output.jsonl | tail -1 | jq .
```

### Debug Mode
```bash
export ADW_DEBUG=true
uv run adw_plan_build.py 123  # Verbose output
```

## Configuration

### ADW Tracking
Each workflow run gets a unique 8-character ID (e.g., `a1b2c3d4`) that appears in:
- Issue comments: `a1b2c3d4_ops: ✅ Starting ADW workflow`
- Output files: `agents/a1b2c3d4/sdlc_planner/raw_output.jsonl`
- Git commits and PRs

### Model Selection
Edit `agent.py` line 129 to change model:
- `model="sonnet"` - Faster, lower cost (default)
- `model="opus"` - Better for complex tasks

### Output Structure
```
agents/
├── a1b2c3d4/
│   ├── sdlc_planner/
│   │   └── raw_output.jsonl
│   └── sdlc_implementor/
│       └── raw_output.jsonl
```

## Security Best Practices

- Store tokens as environment variables, never in code
- Use GitHub fine-grained tokens with minimal permissions
- Set up branch protection rules
- Require PR reviews for ADW changes
- Monitor API usage and set billing alerts

## Technical Details

### Core Components
- `agent.py` - Claude Code CLI integration
- `data_types.py` - Pydantic models for type safety
- `github.py` - GitHub API operations
- `adw_plan_build.py` - Main workflow orchestration (plan & build)

### Branch Naming
```
{type}-{issue_number}-{adw_id}-{slug}
```
Example: `feat-456-e5f6g7h8-add-user-authentication`

### Commit Format
```
{type}: {description} for #{issue_number}

Generated with ADW ID: {adw_id}
🤖 Generated with [Claude Code](https://claude.ai/code)
```

### API Rate Limits
- GitHub: 5000 requests/hour (authenticated)
- Anthropic: Based on your plan tier
- Automatic retry with exponential backoff