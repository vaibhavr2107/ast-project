import React, { useState, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

const Parser = () => {
  const [cloneUrl, setCloneUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/parse', { cloneUrl, username, password });
      console.log(response.data)
      setParseResult(response.data);
    } catch (err) {
      setError('Failed to parse repository. Please check your inputs and try again.');
      console.error('Error parsing repository:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      name: 'Method',
      selector: row => row.method,
      cellExport: row => row.method,
      sortable: true,
    },
    {
      name: 'File',
      selector: row => row.file,
      cellExport: row => row.file,
      sortable: true,
    },
    {
      name: 'Endpoint Type',
      selector: row => row.endpoint_type,
      cellExport: row => row.endpoint_type,
      sortable: true,
    },
    {
      name: 'Flow',
      selector: row => row.flow,
      cell: row => (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {row.flow.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ),
      cellExport: row => row.flow.join(', '),
      sortable: true,
    },
    {
      name: 'TSYS Calls',
      selector: row => row.tsys_calls.join(', '),
      cellExport: row => row.tsys_calls.join(', '),
      sortable: true,
    },
    {
      name: 'AMQ Calls',
      selector: row => row.amq_calls.join(', '),
      cellExport: row => row.amq_calls.join(', '),
      sortable: true,
    },
    {
      name: 'Proc Calls',
      selector: row => row.proc_calls.join(', '),
      cellExport: row => row.proc_calls.join(', '),
      sortable: true,
    },
  ], []);

  const data = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.parseResult.endpoints;
  }, [parseResult]);

  const tableData = {
    columns,
    data,
  };

  const summaryColumns = useMemo(() => [
    { name: 'Total Endpoints', selector: row => row.total_endpoints, cellExport: row => row.total_endpoints, sortable: true },
    { name: 'SOAP Endpoints', selector: row => row.soap_endpoints.count, cellExport: row => row.soap_endpoints.count, sortable: true },
    { name: 'REST Endpoints', selector: row => row.rest_endpoints.count, cellExport: row => row.rest_endpoints.count, sortable: true },
    { name: 'Stored Proc Calls', selector: row => row.stored_proc_calls, cellExport: row => row.stored_proc_calls, sortable: true },
  ], []);

  const summaryData = useMemo(() => {
    if (!parseResult) return [];
    return [parseResult.parseResult.summary];
  }, [parseResult]);

  const summaryTableData = {
    columns: summaryColumns,
    data: summaryData,
  };

  return (
    <div className="parser-container">
      <div className="form-container">
        <h1>Welcome back!</h1>
        <p>Start parsing your repository faster and better</p>
        <form onSubmit={handleSubmit} className="parser-form">
          <div className="form-group">
            <input
              type="text"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              placeholder="Repository URL"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Parsing...' : 'Parse'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      {parseResult && (
        <div className="result-container">
          <h2>Summary</h2>
          <DataTableExtensions {...summaryTableData}>
            <DataTable
              columns={summaryColumns}
              data={summaryData}
              noHeader
              defaultSortField="total_endpoints"
              defaultSortAsc={false}
              pagination
              highlightOnHover
            />
          </DataTableExtensions>

          <h2>Endpoints</h2>
          <DataTableExtensions {...tableData}>
            <DataTable
              columns={columns}
              data={data}
              noHeader
              defaultSortField="method"
              defaultSortAsc={false}
              pagination
              highlightOnHover
            />
          </DataTableExtensions>
        </div>
      )}
    </div>
  );
};

export default Parser;