import { ImportKind } from "@prisma/client";
import { createProject, createReportPeriod, uploadSourceFile } from "@/app/actions";
import { prisma } from "@/lib/prisma";

const kindOptions = [
  {
    value: ImportKind.UTILIZATION,
    label: "Utilization / payments"
  },
  {
    value: ImportKind.WORKFORCE,
    label: "Workforce / EEO"
  },
  {
    value: ImportKind.REPORT_TEMPLATE,
    label: "Report template / reference PDF"
  },
  {
    value: ImportKind.SUPPORTING_DOCUMENT,
    label: "Supporting document"
  }
];

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function formatBytes(value: number | null | undefined) {
  if (!value && value !== 0) {
    return "Unknown size";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      periods: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          sourceFiles: {
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      }
    }
  });

  const totalPeriods = projects.reduce((sum, project) => sum + project.periods.length, 0);
  const totalSourceFiles = projects.reduce(
    (sum, project) =>
      sum +
      project.periods.reduce((periodSum, period) => periodSum + period.sourceFiles.length, 0),
    0
  );

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">DACK internal platform</p>
          <h1>Ingest MWBE and EEO reporting packages without the spreadsheet sprawl.</h1>
          <p className="lede">
            Phase 1 now starts with real records: create a project, open a reporting period,
            and attach the utilization, workforce, and reference files needed for review and
            downstream parsing.
          </p>
        </div>

        <div className="heroStats">
          <article>
            <span>{projects.length}</span>
            <p>Projects</p>
          </article>
          <article>
            <span>{totalPeriods}</span>
            <p>Reporting periods</p>
          </article>
          <article>
            <span>{totalSourceFiles}</span>
            <p>Source files</p>
          </article>
        </div>
      </section>

      <section className="workspace">
        <article className="card formCard">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Step 1</p>
              <h2>Create project</h2>
            </div>
            <p>Track each client/job separately so every period and file stays auditable.</p>
          </div>

          <form action={createProject} className="formGrid">
            <label>
              Project name
              <input name="name" placeholder="NYHS Annex Project" required />
            </label>

            <label>
              Client / owner
              <input name="clientName" placeholder="New-York Historical Society" />
            </label>

            <label>
              Internal code
              <input name="code" placeholder="NYHS-ANNEX" />
            </label>

            <label className="fullWidth">
              Description
              <textarea
                name="description"
                placeholder="Capital project, reporting scope, stakeholders, and any special notes."
                rows={4}
              />
            </label>

            <button type="submit">Create project</button>
          </form>
        </article>

        <article className="card formCard">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Step 2</p>
              <h2>Open reporting period</h2>
            </div>
            <p>Use one period per quarter, month, or cumulative run depending on the client.</p>
          </div>

          <form action={createReportPeriod} className="formGrid">
            <label className="fullWidth">
              Project
              <select name="projectId" required defaultValue="">
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Period label
              <input name="label" placeholder="Q4 2025" required />
            </label>

            <label>
              Year
              <input name="year" type="number" min="2000" max="2100" placeholder="2025" />
            </label>

            <label>
              Quarter
              <input name="quarter" placeholder="Q4" />
            </label>

            <label>
              Start date
              <input name="periodStart" type="date" />
            </label>

            <label>
              End date
              <input name="periodEnd" type="date" />
            </label>

            <button type="submit">Create reporting period</button>
          </form>
        </article>

        <article className="card formCard">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Step 3</p>
              <h2>Upload source file</h2>
            </div>
            <p>Store the raw inputs now; parsing and rule application can happen on top of this.</p>
          </div>

          <form action={uploadSourceFile} className="formGrid" encType="multipart/form-data">
            <label className="fullWidth">
              Reporting period
              <select name="reportPeriodId" required defaultValue="">
                <option value="" disabled>
                  Select reporting period
                </option>
                {projects.flatMap((project) =>
                  project.periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {project.name} - {period.label}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Source type
              <select name="kind" required defaultValue={ImportKind.UTILIZATION}>
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              File
              <input name="file" type="file" required />
            </label>

            <label className="fullWidth">
              Notes
              <textarea
                name="notes"
                rows={3}
                placeholder="Anything the reviewer should know about this file."
              />
            </label>

            <button type="submit">Upload source file</button>
          </form>
        </article>
      </section>

      <section className="portfolio">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">Current records</p>
            <h2>Projects in the pipeline</h2>
          </div>
          <p>This is the starting audit trail for every report package you ingest.</p>
        </div>

        {projects.length === 0 ? (
          <article className="card emptyState">
            <h3>No projects yet</h3>
            <p>
              Start by creating one project for NYHS or Cornell, then add a reporting period and
              upload the raw source files.
            </p>
          </article>
        ) : (
          <div className="projectList">
            {projects.map((project) => (
              <article className="card projectCard" key={project.id}>
                <div className="projectHeader">
                  <div>
                    <h3>{project.name}</h3>
                    <p>
                      {project.clientName || "No client set"}
                      {project.code ? ` • ${project.code}` : ""}
                    </p>
                  </div>
                  <span>{project.periods.length} periods</span>
                </div>

                {project.description ? <p className="projectDescription">{project.description}</p> : null}

                {project.periods.length === 0 ? (
                  <div className="periodCard">
                    <p>No reporting periods yet.</p>
                  </div>
                ) : (
                  <div className="periodList">
                    {project.periods.map((period) => (
                      <section className="periodCard" key={period.id}>
                        <div className="periodHeader">
                          <div>
                            <h4>{period.label}</h4>
                            <p>
                              {period.quarter || "Quarter not set"}
                              {period.year ? ` • ${period.year}` : ""}
                            </p>
                          </div>
                          <span>{period.sourceFiles.length} files</span>
                        </div>

                        <p className="periodMeta">
                          {formatDate(period.periodStart)} to {formatDate(period.periodEnd)}
                        </p>

                        {period.sourceFiles.length === 0 ? (
                          <p className="muted">No source files uploaded yet.</p>
                        ) : (
                          <ul className="fileList">
                            {period.sourceFiles.map((file) => (
                              <li key={file.id}>
                                <div>
                                  <strong>{file.originalName || file.name}</strong>
                                  <span>
                                    {file.kind.replaceAll("_", " ")} • {file.status.replaceAll("_", " ")}
                                  </span>
                                </div>
                                <div className="fileMeta">
                                  <span>{formatBytes(file.fileSize)}</span>
                                  <span>{formatDate(file.createdAt)}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
