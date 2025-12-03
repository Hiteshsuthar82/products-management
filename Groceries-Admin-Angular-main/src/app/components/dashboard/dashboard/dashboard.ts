import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { DashboardResponse } from '../../../models/dashboard.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  dashboardData: DashboardResponse | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Chart data
  chartData: any = null;
  chart: any = null;
  selectedMonth: string = 'all';

  orderStatusChartData: any = null;
  orderStatusChart: any = null;
  orderStatusData: any = null;

  selectedStatus: string = 'all';
  selectedPeriod: string = 'all';
  startDate: string = '';
  endDate: string = '';
  
  // Calendar states
  showDatePicker: boolean = false;
  currentMonth1: Date = new Date();
  currentMonth2: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  
  // Cached calendar days to avoid recalculation
  calendarDays1: Date[] = [];
  calendarDays2: Date[] = [];

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ];

periodOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom' }
];

  months = [
    { value: 'all', label: 'All Time' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];
  
  // Historical data
  allOrders: any[] = [];
  allProducts: any[] = [];
  allUsers: any[] = [];
  
  // Legend visibility toggles
  legendVisibility = [true, true, true, true]; // Products, Users, Orders, Revenue

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadHistoricalData();
  }

  ngAfterViewInit(): void {
    // Chart initialization happens after data loads
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        console.log(data);
        this.dashboardData = data;
        this.initializeChart();
        this.loadOrderStatusData(); 
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

// Update your loadOrderStatusData method:
loadOrderStatusData(): void {
  console.log('=== Loading Order Status Data ===');
  const filters: any = { 
    period: this.selectedPeriod,
    status: this.selectedStatus
  };
  
  // Apply date range filter if custom period is selected
  if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
    filters.startDate = this.startDate;
    filters.endDate = this.endDate;
  }
  
  console.log('Sending filters:', filters);

  this.dashboardService.getOrderStatusDistribution(filters).subscribe({
    next: (response: any) => {
      console.log('Order status API response:', response);
      
      if (response && response.distribution) {
        this.orderStatusData = response;
        console.log('Order status data set:', this.orderStatusData);
        
        setTimeout(() => {
          this.initializeOrderStatusChart();
        }, 100);
      } else {
        console.error('Invalid response structure:', response);
        this.orderStatusData = null;
        this.orderStatusChartData = null;
      }
    },
    error: (error) => {
      console.error('Error loading order status distribution:', error);
      this.orderStatusData = null;
      this.orderStatusChartData = null;
    }
  });
}

isDateRangeValid(): boolean {
  return !!(this.startDate && this.endDate);
}

onStatusFilterChange(): void {
  // Check if custom period is selected
  if (this.selectedPeriod === 'custom') {
    // Open date picker automatically
    if (!this.showDatePicker) {
      this.toggleDatePicker();
    }
  } else {
    // Clear custom dates when other periods are selected
    this.startDate = '';
    this.endDate = '';
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.loadOrderStatusData();
  }
}

// Calendar methods
toggleDatePicker(): void {
  this.showDatePicker = !this.showDatePicker;
  if (this.showDatePicker) {
    this.updateCalendarDays();
  }
}

closeDatePicker(): void {
  // Update dates before closing
  if (this.selectedStartDate && this.selectedEndDate) {
    this.startDate = this.formatDateForAPI(this.selectedStartDate);
    this.endDate = this.formatDateForAPI(this.selectedEndDate);
    // Load data with selected dates
    this.loadOrderStatusData();
  }
  // Close the picker
  this.showDatePicker = false;
}

updateCalendarDays(): void {
  this.calendarDays1 = this.getCalendarDays(this.currentMonth1);
  this.calendarDays2 = this.getCalendarDays(this.currentMonth2);
}

previousMonth1(): void {
  this.currentMonth1 = new Date(this.currentMonth1.getFullYear(), this.currentMonth1.getMonth() - 1, 1);
  this.currentMonth2 = new Date(this.currentMonth1.getFullYear(), this.currentMonth1.getMonth() + 1, 1);
  this.updateCalendarDays();
}

nextMonth1(): void {
  this.currentMonth1 = new Date(this.currentMonth1.getFullYear(), this.currentMonth1.getMonth() + 1, 1);
  this.currentMonth2 = new Date(this.currentMonth1.getFullYear(), this.currentMonth1.getMonth() + 1, 1);
  this.updateCalendarDays();
}

previousMonth2(): void {
  this.currentMonth2 = new Date(this.currentMonth2.getFullYear(), this.currentMonth2.getMonth() - 1, 1);
  this.currentMonth1 = new Date(this.currentMonth2.getFullYear(), this.currentMonth2.getMonth() - 1, 1);
  this.updateCalendarDays();
}

nextMonth2(): void {
  this.currentMonth2 = new Date(this.currentMonth2.getFullYear(), this.currentMonth2.getMonth() + 1, 1);
  this.currentMonth1 = new Date(this.currentMonth2.getFullYear(), this.currentMonth2.getMonth() - 1, 1);
  this.updateCalendarDays();
}

getMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

trackByDate(index: number, date: Date): number {
  return date.getTime();
}

getCalendarDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days: Date[] = [];
  
  // Add previous month's days
  const prevMonth = new Date(year, month - 1, 0);
  const prevDaysInMonth = prevMonth.getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevDaysInMonth - i));
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add next month's days to fill the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

getDayClasses(day: Date): string {
  const isToday = this.isSameDay(day, new Date());
  const isSelected = this.isDateSelected(day);
  const isInRange = this.isDateInRange(day);
  const isOtherMonth = day.getMonth() !== this.currentMonth1.getMonth() && day.getMonth() !== this.currentMonth2.getMonth();
  
  let classes = '';
  if (isSelected) {
    classes += 'text-white font-semibold border-2 ';
  } else if (isInRange) {
    classes += 'bg-blue-100 text-blue-800 ';
  } else if (isToday) {
    classes += 'bg-blue-50 text-blue-600 font-semibold ';
  } else if (isOtherMonth) {
    classes += 'text-gray-300 ';
  } else {
    classes += 'text-gray-700 ';
  }
  
  return classes;
}

getDayStyle(day: Date): any {
  if (this.isDateSelected(day)) {
    return { 'background-color': 'rgb(29 78 216)' };
  }
  return {};
}

isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

isDateSelected(date: Date): boolean {
  if (!this.selectedStartDate && !this.selectedEndDate) return false;
  if (this.selectedStartDate && this.selectedEndDate) {
    return this.isSameDay(date, this.selectedStartDate) || this.isSameDay(date, this.selectedEndDate);
  }
  if (this.selectedStartDate && !this.selectedEndDate) {
    return this.isSameDay(date, this.selectedStartDate);
  }
  return false;
}

isDateInRange(date: Date): boolean {
  if (!this.selectedStartDate || !this.selectedEndDate) return false;
  const dateTime = date.getTime();
  const startTime = this.selectedStartDate.getTime();
  const endTime = this.selectedEndDate.getTime();
  return dateTime >= startTime && dateTime <= endTime;
}

selectDate(date: Date, calendar: number): void {
  if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
    // Start new selection
    this.selectedStartDate = new Date(date);
    this.selectedEndDate = null;
  } else if (this.selectedStartDate && !this.selectedEndDate) {
    // Select end date
    if (date.getTime() < this.selectedStartDate.getTime()) {
      // If selected date is before start, swap them
      this.selectedEndDate = new Date(this.selectedStartDate);
      this.selectedStartDate = new Date(date);
    } else {
      this.selectedEndDate = new Date(date);
    }
  }
  this.updateCalendarDays();
}

updateSelectedDates(): void {
  if (this.selectedStartDate && this.selectedEndDate) {
    this.startDate = this.formatDateForAPI(this.selectedStartDate);
    this.endDate = this.formatDateForAPI(this.selectedEndDate);
    this.onStatusFilterChange();
  }
}

formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

getFormattedDateRange(): string {
  if (this.startDate && this.endDate) {
    const start = this.formatDateDisplay(this.startDate);
    const end = this.formatDateDisplay(this.endDate);
    return `${start} ~ ${end}`;
  }
  return 'dd-mm-yyyy ~ dd-mm-yyyy';
}

formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

selectToday(): void {
  const today = new Date();
  this.selectedStartDate = new Date(today);
  this.selectedEndDate = new Date(today);
  this.updateCalendarDays();
}

selectYesterday(): void {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  this.selectedStartDate = new Date(yesterday);
  this.selectedEndDate = new Date(yesterday);
  this.updateCalendarDays();
}

selectLast7Days(): void {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);
  this.selectedStartDate = lastWeek;
  this.selectedEndDate = today;
  this.updateCalendarDays();
}

clearCustomFilters(): void {
  this.startDate = '';
  this.endDate = '';
  this.selectedStartDate = null;
  this.selectedEndDate = null;
  this.onStatusFilterChange();
}

  loadHistoricalData(): void {
    let ordersLoaded = false;
    let productsLoaded = false;
    let usersLoaded = false;

    const checkAndInitialize = () => {
      if (ordersLoaded && productsLoaded && usersLoaded) {
        console.log('All historical data loaded. Reinitializing chart...', {
          orders: this.allOrders.length,
          products: this.allProducts.length,
          users: this.allUsers.length
        });
        this.initializeChart();
        
      }
    };

    // Load all orders
    this.orderService.getOrders({ limit: 1000 }).subscribe({
      next: (response) => {
        this.allOrders = response.orders || [];
        ordersLoaded = true;
        checkAndInitialize();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        ordersLoaded = true;
        checkAndInitialize();
      }
    });

    // Load all products
    this.productService.getProducts({ limit: 1000 }).subscribe({
      next: (response) => {
        console.log('Products API response:', response);
        // Extract products - response structure is {count, total, page, pages, products: []}
        this.allProducts = (response as any).products || response.data?.products || [];
        console.log('Products loaded:', this.allProducts.length);
        console.log('First product:', this.allProducts[0]);
        productsLoaded = true;
        checkAndInitialize();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        productsLoaded = true;
        checkAndInitialize();
      }
    });

    // Load all users
    this.userService.getUsers({ limit: 1000 }).subscribe({
      next: (response) => {
        this.allUsers = response.users || [];
        usersLoaded = true;
        checkAndInitialize();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        usersLoaded = true;
        checkAndInitialize();
      }
    });
  }

  

  initializeChart(): void {
    if (!this.dashboardData) return;
    
    // Generate chart data based on current selection
    const currentMonth = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    
    // Get appropriate labels based on selected time period
    let labels: string[];
    if (this.selectedMonth === 'all') {
      // Find the actual date range of data
      const allDates = [...this.allOrders, ...this.allProducts, ...this.allUsers]
        .map(item => {
          const dateToUse = item.updatedAt || item.createdAt;
          return dateToUse ? new Date(dateToUse) : null;
        })
        .filter(Boolean) as Date[];
      
      let startMonth = 0;
      let startYear = new Date().getFullYear();
      
      if (allDates.length > 0) {
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        startMonth = minDate.getMonth();
        startYear = minDate.getFullYear();
      }
      
      // Generate labels for 12 months starting from the oldest data
      labels = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(startYear, startMonth + i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        labels.push(monthName);
      }
    } else if (currentMonth !== null) {
      // Show weeks for selected month
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
    
    // Generate data for each dataset based on actual historical data
    const productsData = this.getProductsData();
    const usersData = this.getUsersData();
    const ordersData = this.getOrdersData();
    const revenueData = this.getRevenueData();
    
    console.log('Chart Data Generated:', {
      selectedMonth: this.selectedMonth,
      products: productsData,
      users: usersData,
      orders: ordersData,
      revenue: revenueData
    });
    
    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Products',
          data: productsData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4
        },
        {
          label: 'Users',
          data: usersData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.4
        },
        {
          label: 'Orders',
          data: ordersData,
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          tension: 0.4
        },
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.5)',
          tension: 0.4,
        
        }
      ]
    };
    
    // Delay to ensure canvas is available
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  renderChart(): void {
    const canvas = document.getElementById('dashboard-chart') as HTMLCanvasElement;
    if (!canvas || !this.chartData) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prepare datasets for bar chart
    const barDatasets = this.chartData.datasets.map((dataset: any) => ({
      ...dataset,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }));

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.chartData.labels,
        datasets: barDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top' as const,
            display: true,
            onClick: (e: any, legendItem: any, legend: any) => {
              const index = legendItem.datasetIndex;
              const ci = this.chart;
              
              // Toggle visibility
              this.legendVisibility[index] = !this.legendVisibility[index];
              
              if (ci.isDatasetVisible(index)) {
                ci.hide(index);
              } else {
                ci.show(index);
              }
              
              // Force update with animation
              ci.update('none');
            },
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 13,
                weight: 'bold',
                family: 'Inter, system-ui, -apple-system'
              },
              filter: (legendItem: any, chartData: any) => true,
              boxWidth: 20,
              boxHeight: 20
            }
          },
          title: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                // Format numbers with commas
                label += new Intl.NumberFormat().format(context.parsed.y);
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: false,
            ticks: {
              callback: function(value: any) {
                return value.toLocaleString();
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            stacked: false,
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  generateData(total: number, isMoney: boolean = false): number[] {
    // Generate data based on actual historical data filtered by createdAt
    const monthIndex = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    const currentYear = new Date().getFullYear();
    
    if (this.selectedMonth === 'all') {
      // For "All Time", show monthly data for the last 12 months
      const last12Months: number[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(currentYear, new Date().getMonth() - i, 1);
        const count = this.getCountForMonth(targetDate);
        last12Months.push(count);
      }
      
      return last12Months;
    } else if (monthIndex !== null) {
      // For specific month, show weekly data
      const targetMonth = monthIndex;
      // Calculate number of weeks in the selected month
      const daysInMonth = new Date(currentYear, targetMonth + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const weeks = Array.from({ length: weeksInMonth }, (_, i) => i);
      
      return weeks.map(week => {
        const weekDate = new Date(currentYear, targetMonth, week * 7 + 1);
        const count = this.getCountForWeek(weekDate);
        return isMoney ? Math.round(count) : Math.round(count);
      });
    }
    
    return [0, 0, 0, 0];
  }

  getCountForMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get counts from actual data based on createdAt
    const ordersCount = this.filterByMonth(this.allOrders, year, month).length;
    const productsCount = this.filterByMonth(this.allProducts, year, month).length;
    const usersCount = this.filterByMonth(this.allUsers, year, month).length;
    
    // Return average or sum based on context
    return Math.round((ordersCount + productsCount + usersCount) / 3);
  }

  getCountForWeek(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const week = Math.floor(date.getDate() / 7);
    
    const ordersCount = this.filterByWeek(this.allOrders, year, month, week).length;
    const productsCount = this.filterByWeek(this.allProducts, year, month, week).length;
    const usersCount = this.filterByWeek(this.allUsers, year, month, week).length;
    
    return Math.round((ordersCount + productsCount + usersCount) / 3);
  }

  filterByMonth(items: any[], year: number, month: number): any[] {
    return items.filter(item => {
      const dateToUse = item.updatedAt || item.createdAt;
      if (!dateToUse) return false;
      const itemDate = new Date(dateToUse);
      return itemDate.getFullYear() === year && itemDate.getMonth() === month;
    });
  }

  filterByWeek(items: any[], year: number, month: number, week: number): any[] {
    return items.filter(item => {
      const dateToUse = item.updatedAt || item.createdAt;
      if (!dateToUse) return false;
      const itemDate = new Date(dateToUse);
      
      // Calculate which week of the month the item belongs to
      const dayOfMonth = itemDate.getDate();
      const itemWeek = Math.floor((dayOfMonth - 1) / 7);
      
      return itemDate.getFullYear() === year && 
             itemDate.getMonth() === month && 
             itemWeek === week;
    });
  }

  getProductsData(): number[] {
    if (this.allProducts.length === 0) {
      console.log('No products data available');
      return this.selectedMonth === 'all' ? Array(12).fill(0) : [0, 0, 0, 0];
    }
    
    console.log('All products:', this.allProducts.length, this.allProducts.map(p => ({
      name: p.name,
      createdAt: p.createdAt,
      date: new Date(p.createdAt)
    })));
    
    const currentYear = new Date().getFullYear();
    const monthIndex = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    
    if (this.selectedMonth === 'all') {
      const last12Months: number[] = [];
      
      // Find the date range of all data
      const allDates = [...this.allOrders, ...this.allProducts, ...this.allUsers]
        .map(item => {
          const dateToUse = item.updatedAt || item.createdAt;
          return dateToUse ? new Date(dateToUse) : null;
        })
        .filter(Boolean) as Date[];
      
      if (allDates.length === 0) {
        return Array(12).fill(0);
      }
      
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const startMonth = minDate.getMonth();
      const startYear = minDate.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(startYear, startMonth + i, 1);
        const filtered = this.filterByMonth(this.allProducts, targetDate.getFullYear(), targetDate.getMonth());
        const count = filtered.length;
        console.log(`Products Month ${i}: ${targetDate.toISOString()} - ${count} products`);
        last12Months.push(count);
      }
      console.log('Products data for last 12 months:', last12Months);
      return last12Months;
    } else if (monthIndex !== null) {
      // Calculate number of weeks in the selected month
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const weeks = Array.from({ length: weeksInMonth }, (_, i) => i);
      
      const result = weeks.map(week => {
        const count = this.filterByWeek(this.allProducts, currentYear, monthIndex, week).length;
        return count;
      });
      console.log(`Products data for month ${monthIndex}:`, result);
      return result;
    }
    return [0, 0, 0, 0];
  }

  getUsersData(): number[] {
    const currentYear = new Date().getFullYear();
    const monthIndex = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    
    if (this.selectedMonth === 'all') {
      const last12Months: number[] = [];
      
      // Find the date range of all data
      const allDates = [...this.allOrders, ...this.allProducts, ...this.allUsers]
        .map(item => {
          const dateToUse = item.updatedAt || item.createdAt;
          return dateToUse ? new Date(dateToUse) : null;
        })
        .filter(Boolean) as Date[];
      
      if (allDates.length === 0) {
        return Array(12).fill(0);
      }
      
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const startMonth = minDate.getMonth();
      const startYear = minDate.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(startYear, startMonth + i, 1);
        const count = this.filterByMonth(this.allUsers, targetDate.getFullYear(), targetDate.getMonth()).length;
        last12Months.push(count);
      }
      return last12Months;
    } else if (monthIndex !== null) {
      // Calculate number of weeks in the selected month
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const weeks = Array.from({ length: weeksInMonth }, (_, i) => i);
      
      return weeks.map(week => {
        return this.filterByWeek(this.allUsers, currentYear, monthIndex, week).length;
      });
    }
    return [0, 0, 0, 0];
  }

  getOrdersData(): number[] {
    const currentYear = new Date().getFullYear();
    const monthIndex = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    
    if (this.selectedMonth === 'all') {
      const last12Months: number[] = [];
      
      // Find the date range of all data
      const allDates = [...this.allOrders, ...this.allProducts, ...this.allUsers]
        .map(item => {
          const dateToUse = item.updatedAt || item.createdAt;
          return dateToUse ? new Date(dateToUse) : null;
        })
        .filter(Boolean) as Date[];
      
      if (allDates.length === 0) {
        return Array(12).fill(0);
      }
      
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const startMonth = minDate.getMonth();
      const startYear = minDate.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(startYear, startMonth + i, 1);
        const count = this.filterByMonth(this.allOrders, targetDate.getFullYear(), targetDate.getMonth()).length;
        last12Months.push(count);
      }
      return last12Months;
    } else if (monthIndex !== null) {
      // Calculate number of weeks in the selected month
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const weeks = Array.from({ length: weeksInMonth }, (_, i) => i);
      
      return weeks.map(week => {
        return this.filterByWeek(this.allOrders, currentYear, monthIndex, week).length;
      });
    }
    return [0, 0, 0, 0];
  }

  getRevenueData(): number[] {
    if (this.allOrders.length === 0) {
      console.log('No orders data available for revenue');
      return this.selectedMonth === 'all' ? Array(12).fill(0) : [0, 0, 0, 0];
    }
    
    console.log('Orders data:', this.allOrders.length);
    console.log('Sample order:', this.allOrders[0]);
    console.log('Sample order items:', this.allOrders[0]?.items);
    
    // Check delivered orders specifically
    const deliveredOrders = this.allOrders.filter(o => o.orderStatus === 'delivered');
    console.log('All delivered orders:', deliveredOrders.length);
    console.log('Delivered orders details:', deliveredOrders.map(o => ({
      number: o.orderNumber,
      createdAt: o.createdAt,
      total: o.pricing?.totalPrice,
      items: o.items?.length
    })));
    
    const currentYear = new Date().getFullYear();
    const monthIndex = this.selectedMonth === 'all' ? null : parseInt(this.selectedMonth);
    
    if (this.selectedMonth === 'all') {
      const last12Months: number[] = [];
      
      // Find the date range of all data to determine which months to show
      const allDates = [...this.allOrders, ...this.allProducts, ...this.allUsers]
        .map(item => {
          const dateToUse = item.updatedAt || item.createdAt;
          return dateToUse ? new Date(dateToUse) : null;
        })
        .filter(Boolean) as Date[];
      
      if (allDates.length === 0) {
        return Array(12).fill(0);
      }
      
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      console.log('Data date range:', { min: minDate.toISOString(), max: maxDate.toISOString() });
      console.log('Min date:', minDate.getFullYear(), minDate.getMonth());
      console.log('Max date:', maxDate.getFullYear(), maxDate.getMonth());
      
      // Start from the oldest month and go forward 12 months, or to maxDate
      const startMonth = minDate.getMonth();
      const startYear = minDate.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(startYear, startMonth + i, 1);
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        
        const monthOrders = this.filterByMonth(this.allOrders, targetYear, targetMonth);
        console.log(`Month ${i}: ${targetMonth + 1}/${targetYear} - ${monthOrders.length} orders`);
        
        // Calculate revenue - only from completed/delivered orders
        const deliveredOrders = monthOrders.filter(order => order.orderStatus === 'delivered');
        console.log(`Delivered orders in month ${i}: ${deliveredOrders.length}`);
        
        const revenue = deliveredOrders.reduce((sum, order) => {
          let orderTotal = order.pricing?.totalPrice || 0;
          
          // If totalPrice is 0, calculate from items
          if (orderTotal === 0 && order.items && order.items.length > 0) {
            orderTotal = order.items.reduce((itemSum: number, item: any) => {
              const itemPrice = item.price || item.unitPrice || 0;
              const itemQuantity = item.quantity || 0;
              return itemSum + (itemPrice * itemQuantity);
            }, 0);
          }
          
          console.log(`Delivered Order ${order.orderNumber}: created=${order.createdAt}, total=${orderTotal}`);
          return sum + orderTotal;
        }, 0);
        
        console.log(`Revenue for month ${i}: ${revenue}`);
        last12Months.push(revenue);
      }
      console.log('Revenue data for last 12 months:', last12Months);
      return last12Months;
    } else if (monthIndex !== null) {
      const weeks = [0, 1, 2, 3];
      const result = weeks.map(week => {
        const weekDate = new Date(currentYear, monthIndex, week * 7 + 1);
        const weekOrders = this.filterByWeek(this.allOrders, weekDate.getFullYear(), weekDate.getMonth(), week);
        const revenue = weekOrders
          .filter(order => order.orderStatus === 'delivered') // Only completed orders
          .reduce((sum, order) => {
            let orderTotal = order.pricing?.totalPrice || 0;
            
            // If totalPrice is 0, calculate from items
            if (orderTotal === 0 && order.items && order.items.length > 0) {
              orderTotal = order.items.reduce((itemSum: number, item: any) => {
                const itemPrice = item.price || item.unitPrice || 0;
                const itemQuantity = item.quantity || 0;
                return itemSum + (itemPrice * itemQuantity);
              }, 0);
            }
            
            return sum + orderTotal;
          }, 0);
        return revenue;
      });
      console.log(`Revenue data for month ${monthIndex}:`, result);
      return result;
    }
    return [0, 0, 0, 0];
  }

  onMonthChange(): void {
    this.initializeChart();
  }

  applyCursorPointer(): void {
    const legendElement = document.querySelector('canvas[id="dashboard-chart"]');
    if (legendElement && legendElement.nextElementSibling) {
      const legend = legendElement.nextElementSibling as HTMLElement;
      const legendItems = legend.querySelectorAll('li');
      legendItems.forEach(li => {
        (li as HTMLElement).style.cursor = 'pointer';
        const spans = li.querySelectorAll('*');
        spans.forEach(span => {
          (span as HTMLElement).style.cursor = 'pointer';
        });
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Add this new function for chart colors (keep your existing getStatusColor function)
getChartStatusColor(status: string): { background: string, border: string } {
  switch (status) {
    case 'pending':
      return { background: '#FEF3C7', border: '#F59E0B' }; // Yellow
    case 'confirmed':
      return { background: '#DBEAFE', border: '#3B82F6' }; // Blue
    case 'processing':
      return { background: '#E9D5FF', border: '#8B5CF6' }; // Purple
    case 'shipped':
      return { background: '#C7D2FE', border: '#6366F1' }; // Indigo
    case 'delivered':
      return { background: '#D1FAE5', border: '#10B981' }; // Green
    case 'cancelled':
      return { background: '#FEE2E2', border: '#EF4444' }; // Red
    case 'returned':
      return { background: '#F3F4F6', border: '#6B7280' }; // Gray
    default:
      return { background: '#F3F4F6', border: '#6B7280' }; // Gray
  }
}

// Updated initializeOrderStatusChart method:
initializeOrderStatusChart(): void {
  console.log('=== Initializing order status chart ===');
  console.log('orderStatusData:', this.orderStatusData);
  
  if (!this.orderStatusData) {
    console.log('No orderStatusData available');
    this.orderStatusChartData = null;
    return;
  }

  if (!this.orderStatusData.distribution) {
    console.log('No distribution data available');
    this.orderStatusChartData = null;
    return;
  }

  const distribution = this.orderStatusData.distribution;
  console.log('Distribution object:', distribution);
  
  const labels = Object.keys(distribution);
  const data = Object.values(distribution) as number[];

  console.log('Chart labels:', labels);
  console.log('Chart data:', data);

  // Check if we have valid data
  if (labels.length === 0 || !data.some(count => count > 0)) {
    console.log('No valid chart data available');
    this.orderStatusChartData = null;
    return;
  }

  // Generate consistent colors based on status names
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];
  
  labels.forEach(status => {
    const colors = this.getChartStatusColor(status);
    backgroundColors.push(colors.background);
    borderColors.push(colors.border);
  });

  // Create chart configuration
  const chartConfig = {
    labels: labels.map(status => this.capitalizeStatus(status)),
    datasets: [{
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 2
    }]
  };

  console.log('Chart config created:', chartConfig);
  this.orderStatusChartData = chartConfig;

  // Create the chart with a longer delay to ensure DOM is ready
  setTimeout(() => {
    this.createOrderStatusChart();
  }, 300);
}
  createOrderStatusChart(): void {
    const canvas = document.getElementById('order-status-chart') as HTMLCanvasElement;
    if (!canvas || !this.orderStatusChartData) return;
  
    if (this.orderStatusChart) {
      this.orderStatusChart.destroy();
    }
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    this.orderStatusChart = new Chart(ctx, {
      type: 'pie',
      data: this.orderStatusChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed;
                const t = this.orderStatusData?.total || 1;
                const pct = ((v / t) * 100).toFixed(1);
                return `${ctx.label}: ${v} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Add this method to get status breakdown text
getStatusBreakdownText(): string {
  if (!this.orderStatusData || !this.orderStatusData.distribution) {
    return '';
  }

  const distribution = this.orderStatusData.distribution;
  const total = this.orderStatusData.total || 0;

  if (this.selectedStatus !== 'all') {
    // Show specific status count
    const statusCount = distribution[this.selectedStatus] || 0;
    return `${this.capitalizeStatus(this.selectedStatus)}: ${statusCount}`;
  } else {
    // Show all status counts
    const statusTexts = Object.entries(distribution).map(([status, count]) => 
      `${this.capitalizeStatus(status)}: ${count}`
    );
    return statusTexts.join(' | ');
  }
}

// Add this method to get the total count
getTotalOrdersWithBreakdown(): string {
  if (!this.orderStatusData) {
    return '0';
  }
  
  const total = this.orderStatusData.total || 0;
  return `Total: ${total}`;
}
  
  
  getOrderStatusCounts(): { [key: string]: number } {
    const statusCounts: { [key: string]: number } = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    };
  
    this.allOrders.forEach(order => {
      const status = order.orderStatus || 'pending';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });
  
    // Remove statuses with 0 count for cleaner chart
    Object.keys(statusCounts).forEach(key => {
      if (statusCounts[key] === 0) {
        delete statusCounts[key];
      }
    });
  
    return statusCounts;
  }
  
  capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  getTotalOrders(): number {
    if (this.orderStatusData && this.orderStatusData.total) {
      return this.orderStatusData.total;
    }
    return this.allOrders ? this.allOrders.length : 0;
  }  

  
}
