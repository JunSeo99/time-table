import { useState, useEffect } from 'react';
import { TableState } from '@/types/table';
import styles from './Table.module.css';

interface TableProps {
  tableNumber: number;
  initialState: TableState;
  onStateChange: (tableNumber: number, endDate: string | null) => void;
}

const BASE_TIME = 2 * 60 * 60;
const MAX_EXTENSION = 7 * 60 * 60;
const EXTENSION_UNIT = 60 * 60;

export default function Table({ tableNumber, initialState, onStateChange }: TableProps) {
  const [state, setState] = useState<TableState>(initialState);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.endDate) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(state.endDate!).getTime();
        const remaining = Math.max(0, Math.floor((end - now) / 1000));
        
        setState(prev => ({ ...prev, remainingTime: remaining }));
        
        if (remaining <= 0) {
          alert(`테이블 ${tableNumber} 시간이 종료되었습니다!`);
          handleReset();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.endDate, tableNumber]);

  const formatTime = (seconds: number): string => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStart = () => {
    const endDate = new Date(Date.now() + BASE_TIME * 1000).toISOString();
    setState({ ...state, endDate, isActive: true, remainingTime: BASE_TIME });
    onStateChange(tableNumber, endDate);
  };

  const handleExtend = () => {
    if (!state.endDate || !state.remainingTime) return;
    
    const currentRemaining = state.remainingTime;
    if (currentRemaining >= BASE_TIME + MAX_EXTENSION) return;
    
    const newEndDate = new Date(Date.now() + (currentRemaining + EXTENSION_UNIT) * 1000).toISOString();
    setState({ ...state, endDate: newEndDate });
    onStateChange(tableNumber, newEndDate);
  };

  const handleReset = () => {
    setState({ ...state, endDate: null, isActive: false, remainingTime: null });
    onStateChange(tableNumber, null);
  };

  return (
    <div className={`${styles.tableContainer} ${state.isActive ? styles.active : ''}`}>
      <h2 className={styles.title}>테이블 {tableNumber}</h2>
      <div className={styles.timer}>
        {state.remainingTime !== null ? formatTime(state.remainingTime) : '사용 가능'}
      </div>
      <button
        className={styles.startButton}
        onClick={handleStart}
        disabled={state.isActive}
      >
        시작
      </button>
      <button
        className={styles.extendButton}
        onClick={handleExtend}
        disabled={!state.isActive}
      >
        +1시간
      </button>
      <button
        className={styles.resetButton}
        onClick={handleReset}
        disabled={!state.isActive}
      >
        초기화
      </button>
    </div>
  );
} 