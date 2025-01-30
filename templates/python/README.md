# Python Execution Template

This folder serves as a template for Python code execution environments. It contains all necessary dependencies and configurations pre-installed to optimize execution time and ensure consistency.

## Structure
```
template-folder/
├── venv/           # Python virtual environment with pre-installed dependencies
├── requirements.txt # Project dependencies
└── pytest.ini      # Test runner configuration
```

## Dependencies
- pytest==8.0.0 (Test runner)
- pytest-json-report==1.5.0 (JSON output formatter)

## Usage
This template is used internally by the execution service. The service will:
1. Create symlinks to this template in a temporary execution directory
2. Place user code in the src/ directory
3. Execute tests using the pre-configured pytest setup

## Maintenance
To update dependencies:
1. Update versions in requirements.txt
2. Recreate the virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```
3. Test the template with sample code
4. Lock down permissions if necessary

## Security
- Template directory should be read-only
- Dependencies are locked to specific versions
- User code is isolated in src/ directory
- Virtual environment prevents system-wide package conflicts 