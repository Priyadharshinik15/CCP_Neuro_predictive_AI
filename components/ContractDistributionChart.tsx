import React, { useEffect, useRef } from 'react';
import { select, pie, arc, scaleOrdinal, schemeCategory10 } from 'd3';
import { Contract } from '../types';

interface ContractDistributionChartProps {
  contracts: Contract[];
}

const ContractDistributionChart: React.FC<ContractDistributionChartProps> = ({ contracts }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || contracts.length === 0) return;

    // 1. Process data
    const contractsByCountry = contracts.reduce((acc, contract) => {
      // Get the last part of the location string, assuming it's the country
      const country = contract.location.name.split(', ').pop()?.trim() || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(contractsByCountry).map(([country, count]) => ({ country, count }));

    // 2. Setup chart dimensions
    const { width } = containerRef.current.getBoundingClientRect();
    const height = Math.min(width, 250); // Adjusted height for aesthetics
    const radius = Math.min(width, height) / 2 - 10;

    // 3. Setup SVG
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .html(''); // Clear previous renders

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // 4. Color scale
    const color = scaleOrdinal(schemeCategory10);

    // 5. Pie generator
    const pieGenerator = pie<typeof data[0]>()
      .value(d => d.count)
      .sort(null);

    const pieData = pieGenerator(data);

    // 6. Arc generator
    const arcGenerator = arc<typeof pieData[0]>()
      .innerRadius(radius * 0.6) // Donut chart
      .outerRadius(radius);

    // 7. Create tooltip
    select(containerRef.current).select('.d3-tooltip').remove();
    const tooltip = select(containerRef.current)
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "rgba(17, 24, 39, 0.8)") // bg-gray-900 with opacity
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("border", "1px solid #374151"); // border-gray-700

    // 8. Draw slices
    g.selectAll('path')
      .data(pieData)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', (d, i) => color(i.toString()))
      .attr('stroke', '#1F2937') // bg-gray-800
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');
        
        const total = contracts.length;
        const percentage = ((d.data.count / total) * 100).toFixed(1);
        
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="font-weight: 600;">${d.data.country}</div><div>${d.data.count} contracts (${percentage}%)</div>`);
      })
      .on('mousemove', (event) => {
        // Position tooltip relative to the container
        const [x, y] = [event.pageX, event.pageY];
        const containerRect = containerRef.current!.getBoundingClientRect();
        tooltip
          .style("top", `${y - containerRect.top - 10}px`)
          .style("left", `${x - containerRect.left + 15}px`);
      })
      .on('mouseout', (event) => {
        select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');
        tooltip.style('visibility', 'hidden');
      });

  }, [contracts]);

  if (contracts.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No contract data available.</p>;
  }

  return (
    <div ref={containerRef} className="w-full h-[250px] relative flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ContractDistributionChart;
