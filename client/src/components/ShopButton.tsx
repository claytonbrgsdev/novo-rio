import React, { FC } from 'react';

interface ShopButtonProps {
  onClick: () => void;
}

const ShopButton: FC<ShopButtonProps> = ({ onClick }) => (
  <button className="shop-button" onClick={onClick}>
    Loja
  </button>
);

export default ShopButton;
