  (function() {
    const mediaTypes = [
      {name: "Digital", color: "#2196f3"},      // Bright blue - excellent contrast
      {name: "Print", color: "#4caf50"},        // Green - good contrast  
      {name: "Radio", color: "#ff9800"},        // Orange - vibrant contrast
      {name: "Television", color: "#f44336"},   // Red - strong contrast
      {name: "Multiplatform", color: "#9c27b0"} // Purple - excellent distinction
    ];
    const counts = {};
    mediaTypes.forEach(type => counts[type.name] = 0);
    window.outletsGeojsonFeatures.forEach(f => {
      const t = f.properties["Primary Medium"];
      if (counts.hasOwnProperty(t)) counts[t]++;
    });
    
    // Create legend HTML with map title and filtering
    let legendHtml = '<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #333; text-align: center;">New Mexico Local News Map</div>';
    legendHtml += '<div style="border-bottom: 2px solid #ddd; margin-bottom: 10px;"></div>';
    legendHtml += '<div style="font-weight: bold; margin-bottom: 8px; color: #333;">Interactive Legend (Click to Filter)</div>';
    legendHtml += '<div style="margin-bottom: 8px;">';
    legendHtml += '<div class="legend-item" data-type="all" style="cursor: pointer; padding: 3px 0; font-weight: bold;">';
    legendHtml += `<span class="legend-dot" style="background:#666;"></span> Show All (${Object.values(counts).reduce((a, b) => a + b, 0)})`;
    legendHtml += '</div>';
    legendHtml += '</div>';
    
    mediaTypes.forEach(type => {
      legendHtml += `<div class="legend-item" data-type="${type.name}" style="cursor: pointer; padding: 2px 0; border-radius: 3px; margin: 1px 0;">`;
      legendHtml += `<span class="legend-dot" style="background:${type.color};"></span> ${type.name} (${counts[type.name]})`;
      legendHtml += '</div>';
    });
    legendHtml += '<br><small>* = outlet did not provide</small>';
    document.getElementById('legend').innerHTML = legendHtml;
    
    // Store media types globally for filtering
    window.mediaTypes = mediaTypes;
    window.activeFilter = 'all'; // Track current filter
  })();