import React, { useEffect, useRef, useState } from 'react';
import { select, geoMercator, geoPath, json, zoom } from 'd3';
import * as topojson from 'topojson-client';
import { Contract } from '../types';
import Card from './shared/Card';
import ContractDetailModal from './shared/ContractDetailModal';
import Spinner from './shared/Spinner';

interface GlobalContractsMapProps {
  contracts: Contract[];
}

// Extracted side panel component for better code organization
const CountryContractsPanel: React.FC<{
  selectedCountryData: { name: string; contracts: Contract[] } | null;
  onClose: () => void;
  onContractSelect: (contract: Contract) => void;
}> = ({ selectedCountryData, onClose, onContractSelect }) => {
  return (
    <div 
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-sm bg-gray-800 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
            selectedCountryData ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!selectedCountryData}
    >
        {selectedCountryData && (
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Contracts in {selectedCountryData.name}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-3xl leading-none"
                        aria-label={`Close details for ${selectedCountryData.name}`}
                    >
                        &times;
                    </button>
                </div>
                <ul className="overflow-y-auto space-y-3 flex-grow">
                    {selectedCountryData.contracts.map(contract => (
                        <li 
                            key={contract.id}
                            onClick={() => onContractSelect(contract)}
                            className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onContractSelect(contract)}
                        >
                            <p className="font-semibold text-white truncate">{contract.title}</p>
                            <p className="text-sm text-gray-400 truncate">{contract.parties.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};


const GlobalContractsMap: React.FC<GlobalContractsMapProps> = ({ contracts }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountryData, setSelectedCountryData] = useState<{ name: string; contracts: Contract[] } | null>(null);

  const countryNameMap: { [key: string]: string } = {
    'USA': 'United States of America',
    'UK': 'United Kingdom',
  };

  const getCountryNameFromContract = (contract: Contract): string | undefined => {
    const parts = contract.location.name.split(', ');
    const countryAbbr = parts[parts.length - 1];
    return countryNameMap[countryAbbr] || countryAbbr;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    select(containerRef.current).select(".d3-tooltip").remove();
    setIsLoading(true);

    const { width, height } = containerRef.current.getBoundingClientRect();
    const svg = select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    
    svg.on('click', () => {
        setSelectedCountryData(null);
    });

    const projection = geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2 * 1.4]);
      
    const path = geoPath().projection(projection);

    json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then((worldData: any) => {
        const land: any = topojson.feature(worldData, worldData.objects.countries);

        if (land.type === "FeatureCollection") {
          g.selectAll('path')
            .data(land.features)
            .enter().append('path')
            .attr('d', path)
            .attr('fill', (d: any) => selectedCountryData && d.properties.name === selectedCountryData.name ? '#DD6B20' : '#4A5568')
            .attr('stroke', '#2D3748')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('click', (event, d: any) => {
                event.stopPropagation();
                const countryName = d.properties.name;
                
                if (selectedCountryData?.name === countryName) {
                    setSelectedCountryData(null);
                } else {
                    const contractsInCountry = contracts.filter(c => getCountryNameFromContract(c) === countryName);
                    if (contractsInCountry.length > 0) {
                        setSelectedCountryData({ name: countryName, contracts: contractsInCountry });
                    } else {
                        setSelectedCountryData(null);
                    }
                }
            });
        }

        const points = g.selectAll('circle')
          .data(contracts)
          .enter().append('circle')
          .attr('cx', d => projection(d.location.coordinates)![0])
          .attr('cy', d => projection(d.location.coordinates)![1])
          .attr('r', 5)
          .attr('fill', '#F6AD55')
          .attr('stroke', '#FFF')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer');
          
        const tooltip = select(containerRef.current)
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px");

        points.on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible").text(`${d.title} - ${d.location.name}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - containerRef.current!.getBoundingClientRect().top - 10) + "px").style("left", (event.pageX - containerRef.current!.getBoundingClientRect().left + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        })
        .on('click', (event, d) => {
            event.stopPropagation();
            setSelectedContract(d);
            tooltip.style("visibility", "hidden");
        });

        const zoomBehavior = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform.toString());
            });

        svg.call(zoomBehavior);
        setIsLoading(false);
    }).catch(error => {
        console.error("Error loading map data:", error);
        setIsLoading(false);
    });

  }, [contracts, selectedCountryData]);

  return (
    <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Global Contracts Map</h1>
        <Card>
            <div ref={containerRef} className="w-full h-[60vh] relative flex items-center justify-center overflow-hidden">
                {isLoading && <Spinner />}
                <svg ref={svgRef} className={`w-full h-full ${isLoading ? 'hidden' : ''}`}></svg>
            </div>
        </Card>
        
        <CountryContractsPanel 
          selectedCountryData={selectedCountryData}
          onClose={() => setSelectedCountryData(null)}
          onContractSelect={setSelectedContract}
        />
        
        {selectedContract && (
            <ContractDetailModal 
                contract={selectedContract} 
                onClose={() => setSelectedContract(null)} 
            />
        )}
    </div>
  );
};

export default GlobalContractsMap;