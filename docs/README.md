# FreshGuard 2.0 Documentation

This folder contains comprehensive documentation for the FreshGuard 2.0 project.

## Documentation Files

### Core Documentation
- **[implementation.markdown](implementation.markdown)** — Main technical implementation guide
- **[api_reference.md](api_reference.md)** — Complete API endpoint documentation  
- **[data_schema.md](data_schema.md)** — JSON/CSV data structure definitions

### Workflow & Process
- **[workflow.mmd](workflow.mmd)** — Mermaid source for workflow diagram
- **[workflow.png](workflow.png)** — Visual workflow diagram (generate from .mmd)

### Presentation Materials
- **[demo_outline.md](demo_outline.md)** — Step-by-step demo plan for judges
- **[pitch.md](pitch.md)** — Hackathon presentation outline and talking points

### Model Documentation
- **[README_shelf_life_model.md](README_shelf_life_model.md)** — AI/ML model details (if needed)

## Quick Navigation

### For Developers
Start with [implementation.markdown](implementation.markdown) for overall technical architecture, then:
- [api_reference.md](api_reference.md) for endpoint details
- [data_schema.md](data_schema.md) for data structures

### For Demo/Presentation
Use [demo_outline.md](demo_outline.md) for structured demo flow and [pitch.md](pitch.md) for presentation materials.

### For Understanding Workflow
View [workflow.png](workflow.png) for visual process flow.

## Generating Workflow Diagram

To generate the workflow diagram from the Mermaid source:

1. Install Mermaid CLI:
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

2. Generate PNG:
   ```bash
   mmdc -i workflow.mmd -o workflow.png
   ```

## Documentation Standards

- **Markdown Format:** All documentation uses Markdown for consistency
- **Code Examples:** Include working code snippets where relevant
- **API Schemas:** Use JSON examples with field explanations
- **Clear Structure:** Use headers and sections for easy navigation
- **Cross-References:** Link between related documents

## Maintenance

Keep documentation updated with:
- API endpoint changes
- Data schema modifications  
- New features and functionality
- Demo script updates
- Performance metrics and results

## Contributing

When updating documentation:
1. Follow existing format and style
2. Test all code examples
3. Update cross-references as needed
4. Keep demo materials current with functionality
