import React, { useState } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  return (
    <table {...getTableProps()} className="table">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Stash() {
  const [cloneUrl, setCloneUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/stash', {
        cloneUrl,
        username,
        password
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error details:', error);
      if (error.response) {
        setError(error.response.data.error || 'An error occurred on the server');
      } else if (error.request) {
        setError('No response received from the server. Please try again.');
      } else {
        setError('An error occurred while sending the request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Repository Name',
        accessor: 'repoName',
      },
      {
        Header: 'Total Files',
        accessor: 'totalFiles',
      },
      {
        Header: 'Message',
        accessor: 'message',
      },
    ],
    []
  );

  return (
    <div className="stash">
      <h1>Stash Repository Cloner</h1>
      <form onSubmit={handleSubmit} className="stash__form">
        <input
          type="text"
          value={cloneUrl}
          onChange={(e) => setCloneUrl(e.target.value)}
          placeholder="Repository Clone URL"
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cloning...' : 'Clone Repository'}
        </button>
      </form>
      {isLoading && (
        <div className="stash__loading">
          <div className="loading-circle"></div>
        </div>
      )}
      {error && <div className="stash__error">{error}</div>}
      {result && (
        <div className="stash__result">
          <h2>Result:</h2>
          <Table columns={columns} data={[result]} />
        </div>
      )}
    </div>
  );
}

export default Stash;