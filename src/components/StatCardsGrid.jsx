import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar, 
  useTheme, alpha, Fade, Zoom, LinearProgress,
  IconButton, Tooltip, Stack, Chip
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CurrencyRupee as RupeeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import useOrderStore from '../store/useOrderStore';

const StatCardsGrid = () => {
  const theme = useTheme();
  const orders = useOrderStore((state) => state.orders);

  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;
  const pending = orders.filter((o) => o.status === 'Pending').length;
  // Calculate revenue from delivered orders (assuming delivered = paid)
  const revenue = orders
    .filter((o) => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Calculate percentages and trends (mock data for demo)
  const deliveryRate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : 0;
  const pendingRate = totalOrders > 0 ? ((pending / totalOrders) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      subtitle: 'All time orders',
      icon: CartIcon,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
      trend: '+12%',
      trendUp: true,
      progress: 85,
    },
    {
      title: 'Delivered Orders',
      value: delivered,
      subtitle: `${deliveryRate}% completion rate`,
      icon: CheckCircleIcon,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
      trend: '+8%',
      trendUp: true,
      progress: parseFloat(deliveryRate),
    },
    {
      title: 'Pending Deliveries',
      value: pending,
      subtitle: `${pendingRate}% pending`,
      icon: ScheduleIcon,
      gradient: 'linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%)',
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      trend: '-3%',
      trendUp: false,
      progress: parseFloat(pendingRate),
    },
    {
      title: 'Revenue Generated',
      value: `₹${revenue.toLocaleString()}`,
      subtitle: 'Total earnings',
      icon: RupeeIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
      trend: '+15%',
      trendUp: true,
      progress: 92,
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              <DashboardIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 0.5,
                }}
              >
                Dashboard Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Real-time insights and key metrics at a glance
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{flexWrap: 'nowrap', alignItems: 'center'}}>
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
      {/* Add a spacer before the second card (index 1) */}
      {index === 1 && (
        <Grid item xs={3} /> // Spacer to push cards 2, 3, and 4 to the right
      )}
          <Grid item xs={3} key={index}>
            <Zoom in timeout={800 + index * 200}>
              <Card
                elevation={0}
                sx={{
                  height: '200px',
                  width: '100%',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .gradient-bg': {
                      opacity: 0.15,
                    },
                  },
                }}
              >
                {/* Gradient Background */}
                <Box
                  className="gradient-bg"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: stat.gradient,
                    opacity: 0.08,
                    transition: 'opacity 0.3s ease',
                  }}
                />

                <CardContent sx={{ 
                  p: 3, 
                  height: '100%', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                  }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar
                        className="stat-icon"
                        sx={{
                          bgcolor: stat.bgColor,
                          color: stat.color,
                          width: 56,
                          height: 56,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <stat.icon sx={{ fontSize: 28 }} />
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            minHeight: '20px',
                            mb: 0.5,
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            lineHeight: 1.2,
                            minHeight: '40px',
                            alignItems: 'center'
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>

                    {/* <Tooltip title="More options">
                      <IconButton
                        size="small"
                        sx={{
                          opacity: 0.6,
                          '&:hover': {
                            opacity: 1,
                            bgcolor: alpha(stat.color, 0.1),
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip> */}
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(stat.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: stat.gradient,
                        },
                      }}
                    />
                  </Box>

                  {/* Footer */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        minHeight: '20px'
                      }}
                    >
                      {stat.subtitle}
                    </Typography>
                    
                    <Chip
                      icon={stat.trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={stat.trend}
                      size="small"
                      variant="filled"
                      sx={{
                        bgcolor: stat.trendUp 
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                        color: stat.trendUp 
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          fontSize: 14,
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default StatCardsGrid;