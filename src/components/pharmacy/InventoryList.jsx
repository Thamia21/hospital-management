import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Mock data - replace with API calls
const inventory = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    stock: 150,
    unit: 'Tablets',
    manufacturer: 'PharmaCo',
    expiryDate: '2024-12-31',
    price: 5.99,
    reorderLevel: 50
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    category: 'Antibiotics',
    stock: 8,
    unit: 'Capsules',
    manufacturer: 'MediPharm',
    expiryDate: '2024-06-30',
    price: 12.99,
    reorderLevel: 20
  },
  {
    id: 3,
    name: 'Insulin Regular',
    category: 'Diabetes',
    stock: 45,
    unit: 'Vials',
    manufacturer: 'DiabeCare',
    expiryDate: '2024-03-15',
    price: 89.99,
    reorderLevel: 15
  }
];

export default function InventoryList({ searchTerm, lowStockThreshold }) {
  const getStockStatus = (stock, reorderLevel) => {
    if (stock <= lowStockThreshold) {
      return { label: 'Critical Low', color: 'error' };
    } else if (stock <= reorderLevel) {
      return { label: 'Low Stock', color: 'warning' };
    }
    return { label: 'In Stock', color: 'success' };
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Medicine Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Manufacturer</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.stock, item.reorderLevel);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="subtitle2">{item.name}</Typography>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Typography color={item.stock <= item.reorderLevel ? 'error' : 'inherit'}>
                    {item.stock}
                  </Typography>
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>
                  <Typography
                    color={isExpiringSoon(item.expiryDate) ? 'error' : 'inherit'}
                  >
                    {item.expiryDate}
                  </Typography>
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={stockStatus.label}
                    color={stockStatus.color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {/* Handle stock increase */}}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {/* Handle stock decrease */}}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {/* Handle edit */}}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
