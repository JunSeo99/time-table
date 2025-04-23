'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { TableData, TableState } from '@/types/table';
import styles from './page.module.css';

const TOTAL_TABLES = 40;

export default function Home() {
  const [tables, setTables] = useState<TableState[]>([]);

  useEffect(() => {
    // 초기 테이블 데이터 로드
    fetch('/api/tables')
      .then(res => res.json())
      .then((data: TableData[]) => {
        const initialTables = Array.from({ length: TOTAL_TABLES }, (_, i) => {
          const savedTable = data.find(t => t.tableNumber === i + 1);
          return {
            tableNumber: i + 1,
            endDate: savedTable?.endDate || null,
            isActive: !!savedTable?.endDate,
            remainingTime: savedTable?.endDate
              ? Math.max(0, Math.floor((new Date(savedTable.endDate).getTime() - Date.now()) / 1000))
              : null
          };
        });
        setTables(initialTables);
      });
  }, []);

  const handleTableStateChange = (tableNumber: number, endDate: string | null) => {
    setTables(prev => {
      const newTables = prev.map(table =>
        table.tableNumber === tableNumber
          ? {
              ...table,
              endDate,
              isActive: !!endDate,
              remainingTime: endDate
                ? Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 1000))
                : null
            }
          : table
      );

      // 서버에 상태 저장
      fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          newTables
            .filter(t => t.endDate)
            .map(({ tableNumber, endDate, isActive }) => ({
              tableNumber,
              endDate,
              isActive
            }))
        )
      });

      return newTables;
    });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>천국 주점 테이블 타이머</h1>
      <div className={styles.grid}>
        {tables.map(table => (
          <Table
            key={table.tableNumber}
            tableNumber={table.tableNumber}
            initialState={table}
            onStateChange={handleTableStateChange}
          />
        ))}
      </div>
    </main>
  );
}