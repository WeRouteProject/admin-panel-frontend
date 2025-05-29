import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar,
  useTheme, alpha, Fade, Zoom, LinearProgress,
  IconButton, Tooltip, Stack, Chip, Container
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CurrencyRupee as RupeeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import useOrderStore from '../store/useOrderStore';

const StatCardsGrid = () => {
  const theme = useTheme();
  const orders = useOrderStore((state) => state.orders);
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;
  const pending = orders.filter((o) => o.status === 'Pending').length;

  // Calculate revenue from delivered orders
  const revenue = orders
    .filter((o) => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Calculate percentages and trends
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
      progress: Math.min((totalOrders / 100) * 100, 100),
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
      progress: Math.min((revenue / 100000) * 100, 100),
    },
  ];

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 } }}>
      {/* Enhanced Header Section */}
      <Fade in timeout={600}>
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  width: { xs: 40, md: 56 },
                  height: { xs: 40, md: 56 },
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <DashboardIcon sx={{ fontSize: { xs: 20, md: 28 } }} />
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
                    fontSize: { xs: '1.75rem', md: '2.125rem' },
                  }}
                >
                  Dashboard Overview
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InsightsIcon
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: 16, md: 18 }
                    }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  >
                    Real-time insights and key metrics at a glance
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Enhanced Stats Cards Grid */}
      <Grid container spacing={3} sx={{ flexWrap: 'nowrap' }}>
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            {index === 1 && (
              <Grid item xs={3} />
            )}
            <Grid item xs={3} key={index}>
              <Zoom in timeout={800 + index * 200}>
                <Card
                  elevation={0}
                  sx={{
                    height: '200px',
                    width: '100%',
                    minHeight: { xs: 180, sm: 220 },
                    maxWidth: { sm: 300 },
                    borderRadius: { xs: 2, sm: 4 },
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 60px ${alpha(stat.color, 0.15)}`,
                      '& .stat-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '& .gradient-bg': {
                        opacity: 0.12,
                      },
                    },
                  }}
                >
                  {/* Enhanced Gradient Background */}
                  <Box
                    className="gradient-bg"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 80,
                      height: 80,
                      background: stat.gradient,
                      opacity: 0.06,
                      borderRadius: '50%',
                      transition: 'all 0.4s ease',
                    }}
                  />

                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3 },
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Header */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      sx={{ mb: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <Avatar
                          className="stat-icon"
                          sx={{
                            bgcolor: stat.bgColor,
                            color: stat.color,
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            transition: 'all 0.4s ease',
                          }}
                          isch                    >
                          <stat.icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              mb: 0.5,
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: 'text.primary',
                              lineHeight: 1.2,
                              fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                      </Stack>

                      <Tooltip title="More options">
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
                      </Tooltip>
                    </Stack>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stat.progress}
                        sx={{
                          height: { xs: 4, sm: 6 },
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
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
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
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          height: { xs: 20, sm: 24 },
                          '& .MuiChip-icon': {
                            fontSize: { xs: 10, sm: 12 },
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
    </Container>
  );
};

export default StatCardsGrid;