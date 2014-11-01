google.setOnLoadCallback(function() {
	new google.visualization.Query(
		'https://docs.google.com/spreadsheet/tq?key=1UDeeIVxwr5Rpvf4l0WYF_uqpE67QG4mlrD4VxjZMzOc&headers=1&sheet=RFPdata')
	.send( function(response){
	    if(response.isError()) {
	        console.log("Error: "+response.getMessage());
	        return;
	    }

	    dataTable = response.getDataTable();
	    var RFPdata = [];
	    for(r=0; r<dataTable.getNumberOfRows() ; r++){
	    	var cats = dataTable.getValue(r,7);
	    	if(cats) cats = cats.split(",");
	    	RFPdata.push({
	    		'Name': dataTable.getValue(r,0),
	    		'Announcement': dataTable.getValue(r,1),
	    		'ProposalDate': dataTable.getValue(r,2),
	    		'DecisionDate': dataTable.getValue(r,3),
	    		'ProgramStart': dataTable.getValue(r,4),
	    		'ProgramEnd':   dataTable.getValue(r,5),
	    		'URL': dataTable.getValue(r,6),
	    		'Categories': cats,
	    		'Summary': dataTable.getValue(r,8),
	    	});
	    }

	    var vizSettings = {
	    	width: 800
	    };
	    vizSettings.optimalTickCount = vizSettings.width/100;

	    var timeScale = d3.time.scale.utc()
	        .domain([
	        	d3.min(RFPdata, function(d){ return d.Announcement;})-1000000000,
	        	d3.max(RFPdata, function(d){ return d.ProgramEnd;})
	        ])
	        .range([0, vizSettings.width])
	        .clamp(true);
	    var timeTicks = timeScale.ticks(vizSettings.optimalTickCount);
	    var tickFormat = timeScale.tickFormat(vizSettings.optimalTickCount);
	    tickFormat = d3.time.format("%b %y"); // use the best for current limits

	    var vizRoot = d3.select("#tltc-version");

	    var vizTitle = vizRoot.append("span").attr("class","vizTitle").append("a")
		    .attr("target","_blank")
		    .attr("href","https://docs.google.com/spreadsheets/d/1UDeeIVxwr5Rpvf4l0WYF_uqpE67QG4mlrD4VxjZMzOc")
	    	;
		    vizTitle.append("span").attr("class","vizTitleText").text(" RFP Calendar");
		    vizTitle.append("span")
		    	.attr("class","fa fa-calendar")
		    	;

	    var rfpBlocks_g = vizRoot.append("span").attr("class","rfpBlocks");
	    var rfpBlocks = rfpBlocks_g
	    	.selectAll("span.rfpBlock").data(RFPdata).enter().append("span").attr("class","rfpBlock")
	    	.attr("show","ProposalDate");

	    rfpBlocks.append("a")
		    .attr("href",function(d){ return d.URL; })
		    .attr("target","_blank")
		    .attr("class","rfpTitleCell")
	    .append("span")
	    	.attr("class","rfpTitle")
	    	.html(function(d){ return "<span class='rfpTitleThe'>"+d.Name+"</span>";})
//	    	.style("left",function(d){ return timeScale(d.Announcement)+"px"; })
	    .append("span")
			.attr("class","fa fa-info-circle rfpInfo")
			.attr("title","Click for more info")
			.attr("data-toggle","tooltip")
//			.attr("data-viewport","#tltc-version")
			.attr("data-placement","bottom")
			.attr("title",function(d){ return d.Summary})
			.on("mouseover",function(d){
				$(this).tooltip('show');
			})
			;

		var dom_rfpTimeGroup = rfpBlocks.append("span").attr("class","rfpTimeGroup");
		var x;

		x = dom_rfpTimeGroup.append("span").attr("class","timePoint timePoint_Announcement")
			.style("left",function(d){ return (100*timeScale(d.Announcement)/vizSettings.width)+"%"; })
			.style("display",function(d){ return d.Announcement?null:"none"})
			.style("z-index",100)
			;
			x.append("span").attr("class","fa fa-bullhorn");
			x.append("span").attr("class","dateText")
				.html(function(d){ return "<b>" + moment(d.Announcement).format("MMM D, 'YY")+"</b>"; });

		x = dom_rfpTimeGroup.append("span").attr("class","timePoint timePoint_ProposalDate")
			.style("left",function(d){ return (100*timeScale(d.ProposalDate)/vizSettings.width)+"%"; })
			.style("display",function(d){ return d.ProposalDate?null:"none"})
			.style("z-index",80)
			;
			x.append("span").attr("class","fa fa-bell");
			x.append("span").attr("class","dateText").attr("show",true)
				.html(function(d){ return "<b>" + moment(d.ProposalDate).format("MMM D, 'YY")+"</b>"; });

		x = dom_rfpTimeGroup.append("span").attr("class","timePoint timePoint_DecisionDate")
			.style("left",function(d){ return (100*timeScale(d.DecisionDate)/vizSettings.width)+"%"; })
			.style("display",function(d){ return d.DecisionDate?null:"none"})
			.style("z-index",60)
			;
			x.append("span").attr("class","fa fa-trophy");
			x.append("span").attr("class","dateText")
				.html(function(d){ return "<b>" + moment(d.DecisionDate).format("MMM D, 'YY")+"</b>"; });

		x = dom_rfpTimeGroup.append("span").attr("class","timePoint timePoint_ProgramStart")
			.style("left",function(d){ return (100*timeScale(d.ProgramStart)/vizSettings.width)+"%"; })
			.style("width","100%")
			.style("display",function(d){ return d.ProgramStart?null:"none"})
			.style("z-index",40)
			;

			var y = x.append("span").style("position","relative").style("display","block").style("height","16px");
				y.append("span").attr("class","timeBar")
					.style("width",function(d){ 
						if(d.ProgramEnd)
							return (100*(timeScale(d.ProgramEnd)-timeScale(d.ProgramStart))/vizSettings.width)+"%";
						else
							return 5+"px";
					});
			x.append("span").attr("class","dateText")
				.html(function(d){
					var str="Program: <b>" + moment(d.ProgramStart).format("MMM D, 'YY");
					if(d.ProgramEnd){
						str+=" - " + moment(d.ProgramEnd).format("MMM D, 'YY");
					}
					return str+"</b>";
				});

		dom_rfpTimeGroup.selectAll(".timePoint").on("mouseover",function(d){
			this.parentNode.parentNode.setAttribute("show",this.classList[1].substr(10));
		});


		var dom_timeScaleRow= rfpBlocks_g.append("span").attr("class","timeScaleRow");

		var dom_legendHolder = dom_timeScaleRow.append("span").attr("class","rfpTitleCell");

		var dom_timeScaleGroup = dom_timeScaleRow.append("span").attr("class","timeScaleGroup");

//		dom_timeScaleGroup.append("span").attr("class","fa fa-clock-o timeIcon");
//		dom_timeScaleGroup.append("span").attr("class","fa fa-clock-o timeIcon").style("right","0px");
		dom_timeScaleGroup.append("span").attr("class","fa fa-dot-circle-o nowIcon")
			.style("left",function(d){ return (100*timeScale(Date.now())/vizSettings.width)+"%"; }).text(" Now")
			.append("span")
				.attr("class","nowBar")
				.style("height",20*RFPdata.length+"px")
				.style("margin-top","-"+(20*(RFPdata.length+1.5))+"px")
				;

		dom_timeScaleGroup.selectAll("span.timeTick").data(timeTicks)
			.enter()
			.append("span").attr('class',"timeTick")
			.style("left",function(d){ return (100*timeScale(d)/vizSettings.width)+"%";})
			.text(function(d){ return tickFormat(d); });


		var legendDom = dom_legendHolder.append("span").attr("class","vizLegend").selectAll("i.fa").data([
			["bullhorn","Announcement"],
			["bell","ProposalDate"],
			["trophy","DecisionDate"],
		]).enter().append("span").attr("class","legendItem");
		legendDom
			.append("i")
			.attr("class",function(d){ return "fa fa-"+d[0]+" timePoint_"+d[1];});
		legendDom
			.append("span")
			.attr("class","legendText")
			.html(function(d){ return d[1];});
	});
});
