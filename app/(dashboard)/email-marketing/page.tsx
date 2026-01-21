'use client';
import PageHeader from "@/components/ui-mui/page-header";
import { Box, Button, Card, CardHeader, Chip, Divider, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function EmailMarketingDashboard() {
  const rows = Array(8).fill({
    subject: "Info Penting",
    status: "Sent",
    date: "11 Nov 2025",
    stat: "1/1",
    author: "Muhammad",
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Email Marketing"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Email Marketing" },
        ]}
      />

      <div className="my-5 px-4 py-4">
        <Typography component="h1" variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Email Marketing Dashboard
        </Typography>
        <Typography className="text-gray-700">
          Manage your email campaigns and track performance
        </Typography>
      </div>

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <CardHeader title="Campaign List" />

        <Divider />

        {/* ACTION BAR */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
            }}
            sx={{ minWidth: '250px' }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Plus className="w-4 h-4" />}
            >
              Create Campaign
            </Button>
          </Box>
        </Box>

        {/* TABLE */}
        <TableContainer component={Paper} variant="outlined" sx={{ mx: 2, mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent Date</TableCell>
                <TableCell>Statistics</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color="success" size="small" />
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.stat}</TableCell>
                  <TableCell>{row.author}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton size="small">
                        <Eye className="w-4 h-4" />
                      </IconButton>
                      <IconButton size="small">
                        <Pencil className="w-4 h-4" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </div>
  );
}
