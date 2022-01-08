import { useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const ProgressSpinnerW = ({ children, loading }) => {
  const [spinnerStatus, setSpinnerStatus] = useState(true);

  useEffect(() => {
    setSpinnerStatus(loading);
  }, [loading]);

  return (
    <div className='w-full'>
      {spinnerStatus ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth="8"
            fill="var(--surface-ground)"
            animationDuration=".5s"
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ProgressSpinnerW;
