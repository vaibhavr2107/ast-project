import React, { useState, useMemo } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';

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
      setParseResult(response.data.parseResult);
    } catch (err) {
      setError('Failed to parse repository. Please check your inputs and try again.');
      console.error('Error parsing repository:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'File Path',
        accessor: 'filePath',
      },
      {
        Header: 'Methods',
        accessor: 'methods',
        Cell: ({ value }) => value.join(', ')
      },
    ],
    []
  );

  const data = useMemo(() => {
    if (!parseResult) return [];
    return Object.entries(parseResult).map(([filePath, methods]) => ({
      filePath,
      methods,
    }));
  }, [parseResult]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div className="parser-container">
      <form onSubmit={handleSubmit} className="parser-form">
        <div className="form-group">
          <label htmlFor="cloneUrl">Repository cloneUrl:</label>
          <input
            type="text"
            id="cloneUrl"
            value={cloneUrl}
            onChange={(e) => setCloneUrl(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Parsing...' : 'Parse Repository'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      
      {parseResult && (
        <div className="result-container">
          <h2>Parse Result:</h2>
          <table {...getTableProps()} className="result-table">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()}>
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Parser;