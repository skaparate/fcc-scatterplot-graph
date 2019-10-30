import './styles.css';
import * as d3 from 'd3';

const noDoping = 'green';
const doping = 'yellow';
const dsUri =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const padding = 60;
const width = 750;
const height = 400;
const body = d3.select('body');
const wrapper = body.append('div').attr('class', 'wrapper');
const tooltip = wrapper
  .append('div')
  .attr('id', 'tooltip')
  .attr('class', 'tooltip');

wrapper
  .append('h1')
  .text('Cycling Data')
  .attr('id', 'title')
  .style('text-align', 'center');

const svg = wrapper
  .append('svg')
  .attr('width', width + padding)
  .attr('height', height + padding)
  .style('margin', '0 auto')
  .style('display', 'block');

d3.json(dsUri).then(response => {
  console.debug('Response:', response);
  let minYear = 3000,
    maxYear = 0;
  const data = response.map(i => {
    if (minYear > i.Year) {
      minYear = i.Year;
    }
    if (maxYear < i.Year) {
      maxYear = i.Year;
    }
    const split = i.Time.split(':');
    i.Time = new Date(1970, 0, 1, 0, parseInt(split[0]), parseInt(split[1]));
    return i;
  });

  const timeScale = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.Time))
    .range([0, height]);

  const yearScale = d3
    .scaleLinear()
    .domain([minYear - 1, maxYear + 1])
    .range([0, width]);

  const yAxis = d3.axisLeft(timeScale).tickFormat(d3.timeFormat('%M:%S'));
  const xAxis = d3.axisBottom(yearScale).tickFormat(d3.format('d'));

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding}, 0)`)
    .call(yAxis);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${padding}, ${height})`)
    .call(xAxis);

  const legendContainer = svg
    .append('g')
    .attr('id', 'legend')
    .attr('class', 'legend')
    .attr('transform', `translate(${width}, ${height / 2})`);

  legendContainer
    .append('rect')
    .attr('fill', noDoping)
    .attr('stroke', doping)
    .attr('y', -10)
    .attr('x', 10)
    .attr('width', 10)
    .attr('height', 10);

  legendContainer
    .append('text')
    .text('No doping allegations')
    .attr('text-anchor', 'end');

  legendContainer
    .append('rect')
    .attr('fill', doping)
    .attr('stroke', noDoping)
    .attr('y', 20)
    .attr('x', 10)
    .attr('width', 10)
    .attr('height', 10);

  legendContainer
    .append('text')
    .text('Doping allegations')
    .attr('text-anchor', 'end')
    .attr('y', padding / 2);

  svg
    .selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cy', d => timeScale(d.Time))
    .attr('cx', d => yearScale(d.Year))
    .attr('data-yvalue', d => d.Time.toISOString())
    .attr('data-xvalue', d => d.Year)
    .attr('r', 5)
    .attr('transform', `translate(${padding}, 0)`)
    .attr('fill', (d, i) => (response[i].Doping ? 'yellow' : 'green'))
    .attr('stroke', (d, i) => (response[i].Doping ? 'green' : 'yellow'))
    .on('mouseover', d => {
      tooltip
        .style('opacity', 0.9)
        .html(
          `
        Name: ${d.Name}<br />
        Year: ${d.Year}
        `
        )
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px')
        .attr('data-year', d.Year);
    })
    .on('mouseout', d => {
      tooltip.style('opacity', 0);
    });
});
