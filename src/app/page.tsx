'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { TableData, TableState } from '@/types/table';
import styles from './page.module.css';

const TOTAL_TABLES = 40;

export default function Home() {
  const [tables, setTables] = useState<TableState[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTableData = async () => {
    try {
      const res = await fetch('/api/tables');
      if (!res.ok) {
        throw new Error('서버 응답 오류');
      }
      const data: TableData[] = await res.json();
      
      const currentTime = Date.now();
      const initialTables = Array.from({ length: TOTAL_TABLES }, (_, i) => {
        const savedTable = data.find(t => t.tableNumber === i + 1);
        const endDate = savedTable?.endDate;
        const remainingTime = endDate
          ? Math.max(0, Math.floor((new Date(endDate).getTime() - currentTime) / 1000))
          : null;
        
        if (endDate && remainingTime === 0) {
          return {
            tableNumber: i + 1,
            endDate: null,
            isActive: false,
            remainingTime: null
          };
        }

        return {
          tableNumber: i + 1,
          endDate: savedTable?.endDate || null,
          isActive: !!savedTable?.endDate,
          remainingTime
        };
      });

      const expiredTables = initialTables.some(t => t.endDate && t.remainingTime === 0);
      if (expiredTables) {
        const activeTables = initialTables.filter(t => t.endDate && t.remainingTime && t.remainingTime > 0);
        const updateRes = await fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            activeTables.map(({ tableNumber, endDate, isActive }) => ({
              tableNumber,
              endDate,
              isActive
            }))
          )
        });
        
        if (!updateRes.ok) {
          throw new Error('서버 업데이트 오류');
        }
      }

      setTables(initialTables);
    } catch (error) {
      console.error('테이블 데이터 로드 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
    const interval = setInterval(loadTableData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTableStateChange = async (tableNumber: number, endDate: string | null) => {
    try {
      const newTables = tables.map(table =>
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

      const updateRes = await fetch('/api/tables', {
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

      if (!updateRes.ok) {
        throw new Error('서버 업데이트 오류');
      }

      setTables(newTables);
    } catch (error) {
      console.error('테이블 상태 업데이트 중 오류 발생:', error);
      // 오류 발생 시 데이터 다시 로드
      loadTableData();
    }
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

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