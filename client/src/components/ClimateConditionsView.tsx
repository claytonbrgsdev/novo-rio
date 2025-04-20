import React from 'react';
import { useClimateConditions, ClimateCondition } from '../hooks/useClimateConditions';

const ClimateConditionsView: React.FC = () => {
  const { data, isLoading, error } = useClimateConditions();
  if (isLoading) return <p>Loading climate conditions...</p>;
  if (error) return <p>Error loading climate conditions</p>;
  return (
    <ul>
      {data?.map((cc: ClimateCondition) => (
        <li key={cc.id}>
          <strong>{cc.name}</strong>: {cc.description}
        </li>
      ))}
    </ul>
  );
};

export default ClimateConditionsView;
