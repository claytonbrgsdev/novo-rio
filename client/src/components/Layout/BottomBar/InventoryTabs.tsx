import React, { FC } from 'react';

interface InventoryTabsProps {
  tools: any[]
  inputs: any[]
  plantables: any[]
  counts: Record<string, number>
}

const InventoryTabs: FC<InventoryTabsProps> = ({ tools, inputs, plantables, counts }) => (
  <div className="inventory-tabs">InventoryTabs Placeholder</div>
);

export default InventoryTabs;
