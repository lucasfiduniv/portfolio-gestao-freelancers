import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyData } from '@/types';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProductivityChartProps {
  data: WeeklyData[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  // Prepare data for chart
  const chartData = {
    options: {
      chart: {
        id: "productivity-chart",
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      xaxis: {
        categories: data.map(item => item.day),
        labels: {
          style: {
            colors: Array(7).fill('#888'),
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function(value: number) {
            return `${Math.round(value / 60)}h`;
          }
        }
      },
      colors: ['#8338ec'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: "vertical",
          shadeIntensity: 0.4,
          opacityFrom: 0.9,
          opacityTo: 0.5,
          stops: [0, 100]
        }
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
          formatter: function(value: number) {
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            return `${hours}h ${minutes}min`;
          }
        }
      },
      grid: {
        borderColor: '#f1f1f1',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.5
        },
      },
      theme: {
        mode: 'light'
      }
    },
    series: [
      {
        name: "Horas Trabalhadas",
        data: data.map(item => item.hours)
      }
    ]
  };

  // Handle theme changes
  React.useEffect(() => {
    const updateChartTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (window.ApexCharts) {
        window.ApexCharts.exec('productivity-chart', 'updateOptions', {
          theme: {
            mode: isDarkMode ? 'dark' : 'light'
          },
          grid: {
            borderColor: isDarkMode ? '#333' : '#f1f1f1'
          },
          xaxis: {
            labels: {
              style: {
                colors: Array(7).fill(isDarkMode ? '#ccc' : '#888')
              }
            }
          }
        }, false, true);
      }
    };

    // Set initial theme
    updateChartTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateChartTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Produtividade Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {typeof window !== 'undefined' && (
          <div className="w-full h-[300px]">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height="100%"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}