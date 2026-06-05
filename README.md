# SQL Query Panel

View the result of your SQL query in a table, single value, or pie chart panel with Directus Insights.

## Supports

- Global Variables
- Static Queries
- `CALL` statements
- Multiple display modes: table, single value, and pie chart
- Downloading results as CSV (table mode)
- Summary row with count, sum, average, count unique and count groups
- Columns can be made searchable, sortable and marked as numeric
- Actions can be added to an entire row or as buttons at the end of each row with support for adding values from result
- **Security** panel results can only be viewed by users with access to those panels, so you can adjust permissions on a per panel basis via Directus Access


## Install

### Via npm

`npm install directus-extension-sql-query-panel`

## Usage

Add a new panel and select the `SQL Query panel` type.

Enter your SQL query, optionally adding global variables wrapped in `{{ }}` to make your query dynamic.

By default a table will be generated with the selected columns from your query, however you can manually add columns you want to display and configure them.

If you do not use variables, you can mark the panel as static.

## Display modes

Choose a **Display mode** in the panel settings:

### Table (default)

Shows all rows in a virtualized table. Supports column configuration, search, sort, summary row, CSV download, and row actions.

### Single value

Displays values as text or numbers. Defaults to the `value` column. Configure:

- **Value layout** — `single` (first row only) or `multiple` (label | value per row)
- **Value column** — field to display (default: `value`)
- **Label column** — optional field for labels (shown above the value in single layout, or beside each value in multiple layout)
- **Value size** — small, medium, large, or extra large
- **Value format** — auto (text or number), number (locale formatting), or percent

Single KPI example:

```sql
SELECT COUNT(*) AS value FROM orders WHERE status = 'completed'
```

Multiple rows example:

```sql
SELECT name AS label, status AS value
FROM projects
LIMIT 5
```

Set **Value layout** to `multiple`, **Value column** to `value`, and **Label column** to `label`.

### Pie chart

Best for grouped queries with a numeric value per row. Configure:

- **Pie value column** (required) — numeric column used for slice sizes
- **Pie label column** (optional) — legend labels; defaults to `Slice 1`, `Slice 2`, etc.
- **Show legend** / **Show percentages**

Rows with non-numeric, zero, or negative values are skipped.

Example query:

```sql
SELECT status AS label, COUNT(*) AS count
FROM orders
GROUP BY status
```

Set **Pie value column** to `count` and **Pie label column** to `label`.

Table-only features (columns, actions, CSV download) are not used in single value or pie chart modes.

## Events

There are two events that are fired when a query is executed:

	- `sql-query:request` - Fired before variables are replaced in the query (payload: `{ variables: Record<string, any>, query: string }`, request)
	- `sql-query:response` - Fired after the query has been executed (payload: `{items: Record<string, any>[], headers: string[]}`, request)

Use it to add your own logic to the query, for example:

```js
// Check or modify the variables and query before it gets executed
emitter.onFilter('sql-query:request', async ({ variables, query }, req) => {
	// Ensure the current user has access to the tenant
	if (query.includes('{{tenant}}') && variables.tenant) {
		const tenantSrv = new ItemsService('tenants', req);
		try {
			await tenantSrv.readOne(variables.tenant, { fields: ['id'] });
		} catch (e) { throw new Error('Invalid tenant'); }
	}

	// Add tenant if not already present eg.
	// variables.tenant = req.user.tenantId;

	return { variables, query };
})
```

## Contributing

PRs are welcome!

