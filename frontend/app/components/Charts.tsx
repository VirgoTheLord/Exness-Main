import { candles } from "../types/Alltypes";
import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, CandlestickSeries } from "lightweight-charts";
import { parse } from "path";

const Charts = ({
  candles,
  width,
  height,
}: {
  candles: candles[];
  width?: number;
  height?: number;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: { background: { color: "#000000" }, textColor: "#ffffff" },
      grid: {
        vertLines: { color: "#333" },
        horzLines: { color: "#333" },
      },
      crosshair: { mode: 1 },
      timeScale: {
        borderColor: "#333",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: "#333" },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, width]);

  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const chartData = candles
      .map((c) => {
        const timeInSeconds = Math.floor(
          new Date(c.timestamp).getTime() / 1000
        );
        return {
          time: timeInSeconds,
          open: parseFloat(c.open_price),
          high: parseFloat(c.high_price),
          low: parseFloat(c.low_price),
          close: parseFloat(c.close_price),
        };
      })
      .filter((c) => !Object.values(c).some(isNaN))
      .sort((a, b) => (a.time as number) - (b.time as number));

    if (chartData.length) {
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  return <div ref={chartContainerRef} style={{ width: "100%", height }} />;
};

export default Charts;
