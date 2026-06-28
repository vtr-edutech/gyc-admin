import { Plugin } from 'chart.js';

export const hoverLinePlugin: Plugin = {
  id: 'intersectDataVerticalLine',
  beforeDraw: (chart) => {
    if (chart.getActiveElements().length) {
      const activePoint = chart.getActiveElements()[0];
      const chartArea = chart.chartArea;
      const ctx = chart.ctx;
      ctx.save();
      // grey vertical hover line - full chart height
      ctx.beginPath();
      ctx.moveTo(activePoint.element.x, chartArea.top);
      ctx.lineTo(activePoint.element.x, chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0, 0.1)';
      ctx.stroke();
      ctx.restore();
      // coloured vertical hover line - height to dataset line
      ctx.beginPath();
      ctx.moveTo(activePoint.element.x, activePoint.element.y);
      ctx.lineTo(activePoint.element.x, chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = chart.data.datasets[0].borderColor as string;
      ctx.stroke();
      ctx.restore();
    }
  },
};
