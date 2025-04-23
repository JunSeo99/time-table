import { useEffect, useState } from 'react';
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
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [remainingTime, setRemainingTime] = useState(initialState.remainingTime);
  const [endDate, setEndDate] = useState(initialState.endDate);

  // initialState가 변경될 때마다 컴포넌트 상태 업데이트
  useEffect(() => {
    setIsActive(initialState.isActive);
    setRemainingTime(initialState.remainingTime);
    setEndDate(initialState.endDate);
  }, [initialState]);

  // 타이머 업데이트
  useEffect(() => {
    if (!isActive || !endDate) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 1000));
      setRemainingTime(remaining);

      if (remaining === 0) {
        setIsActive(false);
        setEndDate(null);
        onStateChange(tableNumber, null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, endDate, tableNumber, onStateChange]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    const newEndDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2시간
    setEndDate(newEndDate);
    setIsActive(true);
    onStateChange(tableNumber, newEndDate);
  };

  const handleExtend = () => {
    if (!endDate) return;
    const newEndDate = new Date(new Date(endDate).getTime() + 30 * 60 * 1000).toISOString(); // 30분 연장
    setEndDate(newEndDate);
    onStateChange(tableNumber, newEndDate);
  };

  const handleReset = () => {
    setIsActive(false);
    setRemainingTime(null);
    setEndDate(null);
    onStateChange(tableNumber, null);
  };

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>{tableNumber}번 테이블</h2>
      <div className={styles.timer}>{formatTime(remainingTime)}</div>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.startButton}`}
          onClick={handleStart}
          disabled={isActive}
        >
          시작
        </button>
        <button
          className={`${styles.button} ${styles.extendButton}`}
          onClick={handleExtend}
          disabled={!isActive}
        >
          연장
        </button>
        <button
          className={`${styles.button} ${styles.resetButton}`}
          onClick={handleReset}
          disabled={!isActive}
        >
          초기화
        </button>
      </div>
    </div>
  );
} 