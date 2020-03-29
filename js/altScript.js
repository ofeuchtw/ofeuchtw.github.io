
$(document).ready(function() {

	// const color = "#E9BF00";
	// const color = "#800020";
	// const color = "#c991b5";
	// const color = "cornflowerblue";

	const color = "#f44141";	//accent color code
	var grabbed = false;		//indicates whether ball should track cursor
	var instruction1Displayed = true;
	var instruction2Displayed = false;

	//apply accent color
	$("h2").css("color",color);
	$("#sidePanel").css("background-color",color);
	$("#shadow").css("background","-webkit-linear-gradient(left, black, "+ color + ")");

	//set up canvas
	var canvas = document.querySelector("#canvas");
	var ctx = canvas.getContext('2d');

	var windowWidth = $(window).width();
	var width = canvas.width = windowWidth - 50;

	var height = canvas.height = 300;

	var ballX = width/2;
	var ballY = height-25;

	//set up hole coordinates
	var holeX = width/3;
	var holeY = height - 15;
	var holeWidth = 70;
	var holeHeight = 16;

	//set up overlay
	var overlay = document.querySelector("#overlay");
	overlay.width = holeWidth+20;
	overlay.height = 15;
	$(overlay).css("left",holeX+"px");
	var overlayCtx = overlay.getContext('2d');

	$("#instruction_1").css("left", width/2 - 50 + "px");
	$("#instruction_2").css("left",width/2 + 50 + "px");

	resetCanvas();

	
	//emphasizes the current link, decreasing the opacity of the adjacent links
	 $(".link").hover(function() {
	 	this.style.opacity = .8;
	 	var links = $(".link");
	 	for (var i = links.length - 1; i >= 0; i--) {
	 		if(links[i] == this) {continue;}
	 		links[i].style.opacity = .5;
	 	}
    });

	 //resets link opacity to original state
	 $("#links").mouseleave(function(){
	 	var links = $(".link");
	 	for (var i = links.length - 1; i >= 0; i--) {
	 		links[i].style.opacity = .8;
	 	}
	 });

	 //changes width, windowWidth, and ballX to be proportionate with current window size
	 $( window ).resize(function() {
	 	windowWidth = $(this).width();
	 	ballX *= (windowWidth - 50)/width;
	 	holeX *= (windowWidth - 50)/width;
	  	width = canvas.width = windowWidth - 50;

	  	$("#overlay").css("left",holeX+ "px");
	  	resetCanvas();
	 });

	//repositions instruction2 on resize
	$(window).on("resize", shiftInstruction1);

	 //fades out canvas and instructions on scroll, and sets hidden
	$(window).scroll(function(){
    	$("canvas").css("opacity", 1 - $(window).scrollTop() / 350);
    	$(".instruction").css("opacity", 1 - $(window).scrollTop() / 350);
    	if($(window).scrollTop() >= 350) {
    		$("canvas").css("visibility",'hidden');
    		if(instruction1Displayed) {
    			$(".instruction").css("visibility",'hidden');
    		}
    	} else {
    		$("canvas").css("visibility",'visible');
    		if(instruction1Displayed) {
    			$(".instruction").css("visibility",'visible');
    		}
    	}
 	 });

	$(canvas).on({

		//hides instruction 1
	  	mouseenter: function(){
			if(instruction1Displayed){
				$(canvas).off("mouseenter");
				$("#instruction_1").fadeOut(100);
				$(window).off("resize",shiftInstruction1);
				instruction1Displayed = false;
			}
		},

		mousemove: function(event){
			if(grabbed) {
				moveBall(event);
			}
		},

	  	click: function(event){
			if(grabbed) {
				grabbed = false;
				if(isOverHole()) {
					dropBallInHole();
					//TODO: turn off all canvas listeners
				} else {
					dropBall();
				}
			} else {
				tryGrab(event);
			}

		},

		mouseleave: function(event){
			if(grabbed) {
				grabbed = false;
				if(isOverHole()) {
					dropBallInHole();
					//TODO: turn off all canvas listeners
				} else {
					dropBall();
				}

				//hides instruction 2 if displayed
				if(instruction2Displayed) {
					$("#instruction_2").fadeOut(100);
					$(canvas).off("click",displayInstruction2);
					instruction2Displayed = false;
				}
			}
		}

	});

	$(canvas).on("click",displayInstruction2);

	//reveals or hides instruction 2 
	function displayInstruction2() {
		if(!instruction2Displayed) {
			$("#instruction_2").fadeIn(100);
		} else {
			$("#instruction_2").fadeOut(100);
			$(canvas).off("click",displayInstruction2);
		}	

		instruction2Displayed = !instruction2Displayed;
	}

	var sidePanelExpanded = false;

	$("#shadow").hover(function(){
		var shadowPos = $(this).css("right").slice(0,-2);	
		//checks if side panel is fully contracted
		if(shadowPos <= 12){								
			expand();
		}
	});

	$("#sidePanel").on("mouseleave", function(){
		var panelWidth = $(this).css("width").slice(0,-2);
		//checks if side panel is fully expandeds
		if(panelWidth >= 200){
			contract();
		}
	});

	//expands side panel on hover, contracting canvas and shifting over elements
	function expand() {
		if(!sidePanelExpanded) {
			var timer = setInterval(shift,1.4);
			var t = 0;
			var step = ballX * (1- (windowWidth-248)/(windowWidth-50));
			sidePanelExpanded = true; 
			function shift() {
				if(t < 100) {
					$("#shadow").css("right", 10 + 2 * t + 'px');
					$("#sidePanel").css("width", 30 + 2 * t + 'px');
					if($(canvas).css("visibility") == 'visible') {
						width = canvas.width = (windowWidth-50) - 2 * t;
						ballX-= step/100;
						holeX-= step/100;

						if(instruction1Displayed) {
							$("#instruction_1").css("left",width/2 - 50 - (step/100) + "px");
						}
				
						$("#overlay").css("left",holeX+ "px");
						resetCanvas();
					}
					t++;
				} else {
					clearInterval(timer); 
				}
			}  
		}
	}

	//contracts side panel on hover, expanding canvas and shifting over elements
	function contract() {
		if(sidePanelExpanded) {
			var timer = setInterval(shift,1.4);
			var t = 200;
			var step = ((windowWidth-50)/(windowWidth-248)-1) * ballX;
			sidePanelExpanded = false; 
			function shift() {
				if(t > 0) {
					$("#shadow").css("right", 10 + t + 'px');
					$("#sidePanel").css("width", 30 + t + 'px');
					if($(canvas).css("visibility") == 'visible') {
						width = canvas.width = (windowWidth-50) - t;
						ballX+=step/100;
						holeX+=step/100;
						if(instruction1Displayed) {
							$("#instruction_1").css("left",width/2 - 50 + (step/100) + "px");
						}
						$("#overlay").css("left",holeX+ "px");
						resetCanvas();
					}
					t-= 2;
				} else {
					clearInterval(timer); 
				}
			}  
			
		}
	}

	function shiftInstruction1(offset) {
		$("#instruction_1").css("left",width/2 - 50+ "px");
	}

	//clears and redraws current canvas
	function resetCanvas() {
		ctx.translate(0,0);
		ctx.clearRect(0, 0, width, height);
		
		var grd=ctx.createRadialGradient(width/2,height,100,width/2,height,1000);
		grd.addColorStop(0,'#141414');
		grd.addColorStop(1,"black");

		//background
		ctx.fillStyle = grd;
	    ctx.fillRect(0,0,width,height);
		
		//bottom surface
		ctx.fillStyle = 'rgba(255,255,255,.15)';
		ctx.beginPath();
		ctx.moveTo(0,height);
		ctx.lineTo(50,height-25);
		ctx.lineTo(width-50,height-25);
		ctx.lineTo(width,height);
		ctx.lineTo(0,height);
		ctx.fill();

		
		//erase bottom surface under hole
		ctx.fillStyle = "#141414";	
		ctx.fillRect(holeX-10,holeY,10,holeHeight);
		ctx.fillRect(holeX+holeWidth,holeY,10,holeHeight);
		ctx.beginPath();
		ctx.moveTo(holeX,holeY);
		ctx.bezierCurveTo(holeX,holeY+10,holeX+holeWidth,holeY+10,holeX+holeWidth,holeY);
		ctx.lineTo(holeX+holeWidth,holeY+24);
		ctx.lineTo(holeX,holeY+24);
		ctx.lineTo(holeX,holeY);
		ctx.fill();
		

		//top surface
		ctx.fillStyle = 'rgba(255,255,255,.2)';
		ctx.beginPath();
		ctx.lineTo(50,25);
		ctx.lineTo(width-50,25);
		ctx.lineTo(width,0);
		ctx.lineTo(0,0);
		ctx.fill();

		//left surface
		ctx.fillStyle = 'rgba(255,255,255,.1)';
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(50,25);
		ctx.lineTo(50,height-25);
		ctx.lineTo(0,height);
		ctx.fill();

		//right surface
		ctx.beginPath();
		ctx.moveTo(width,0);
		ctx.lineTo(width-50,25);
		ctx.lineTo(width-50,height-25);
		ctx.lineTo(width,height);
		ctx.fill();


		grd=ctx.createRadialGradient(holeX+(holeWidth/2),holeY+holeHeight,holeWidth/10,holeX+(holeWidth/2),holeY,holeWidth/2);
		grd.addColorStop(0,'#141414');
		grd.addColorStop(1,"black");

		ctx.fillStyle = grd;

		//hole
		ctx.beginPath();
		ctx.moveTo(holeX,holeY);
		// ctx.bezierCurveTo(holeX,holeY-7,holeX+holeWidth,holeY-7,holeX+holeWidth,holeY);
		ctx.bezierCurveTo(holeX,holeY-holeHeight+8,holeX+holeWidth,holeY-holeHeight+8,holeX+holeWidth,holeY);
		ctx.moveTo(holeX,holeY);
		// ctx.bezierCurveTo(holeX,holeY+10,holeX+holeWidth,holeY+10,holeX+holeWidth,holeY);
		ctx.bezierCurveTo(holeX,holeY+holeHeight-5,holeX+holeWidth,holeY+holeHeight-5,holeX+holeWidth,holeY);
		ctx.fill();

		drawBall();

		//bottom surface under hole
		overlayCtx.clearRect(0, 0, width, height);
		overlayCtx.fillStyle = 'rgb(54,54,54)';
		overlayCtx.fillRect(0,0,10,holeHeight);
		overlayCtx.fillRect(holeWidth+10,0,10,holeHeight);
		overlayCtx.beginPath();
		overlayCtx.moveTo(10,0);
		overlayCtx.bezierCurveTo(10,holeHeight-5,holeWidth+10,holeHeight-5,holeWidth+10,0);
		overlayCtx.lineTo(holeWidth+10,holeHeight+9);
		overlayCtx.lineTo(10,holeHeight+9);
		overlayCtx.lineTo(10,0);
		overlayCtx.fill();
	}

	//draws the ball on the canvas at its current position
	function drawBall() {

		var grd=ctx.createRadialGradient(ballX-5,ballY-5,9,ballX,ballY,20);
		grd.addColorStop(0, color);
		grd.addColorStop(1,"black");
		ctx.fillStyle = grd;

		ctx.beginPath();
		ctx.arc(ballX, ballY, 10, degToRad(0), degToRad(360), false);
	    ctx.fill();
	
	}

	//if ball is under cursor, sets grabbed to true
	function tryGrab(event) {
		if(Math.abs(event.pageX - 10 - ballX) <= 10 && Math.abs(event.pageY-50-$(window).scrollTop() - ballY) <= 10) {
			grabbed = true;
		}
	}

	//resets ball coordinates to current cursor position (bounded by walls of canvas, offset to adjust for scroll)
	function moveBall(event) {
		ballX = Math.max(Math.min(event.pageX-5, width-30),25);
		ballY = Math.max(Math.min(event.pageY-50-$(window).scrollTop(), 280),20);
		resetCanvas();
	}

	function isOverHole() {
		return ballX >= holeX + 7 && ballX <= holeX + holeWidth-7;
	}

	var velocity = 0;

	//simulates ball drop with gravity
	function dropBall() {

		if(ballY >= height-25) {
			velocity = 0;
			window.cancelAnimationFrame(dropBall);
		} else {
			velocity += .5;
			ballY+=velocity;
			ballY = Math.min(height-25,ballY);
			resetCanvas();
			window.requestAnimationFrame(dropBall);
		}
	}

	function dropBallInHole() {
		if(ballY >= height+ 20) {
			velocity = 0;
			window.cancelAnimationFrame(dropBallInHole);
		} else {
			velocity += .5;
			ballY+=velocity;
			resetCanvas();
			window.requestAnimationFrame(dropBallInHole);
		}
	}
	
});

function degToRad(degrees) {
   return degrees * Math.PI / 180;
};

function displayImages() {
	var images = document.getElementsByClassName('photo');

	var timer = setInterval(fade,15);

	for (var i = images.length - 1; i >= 0; i--) {
		images[i].style.visibility = 'visible';
	}

	var t = 0;
	function fade() {
		if(t < 100) {
			t++;
			for (var i = images.length - 1; i >= 0; i--) {
				images[i].style.opacity = (t/100); 
			}
			if(t==100){
				 // scrollImages();
			}
		}
	}   

	if(t==100){			
		clearInterval(timer); 
	}                          
}

function scrollImages() {
	images = document.getElementsByClassName('photo');

	var id = setInterval(scroll,16);

	var n = 1;

	function scroll() {
		for (var i = images.length - 1; i >= 0; i--) {
			 var currentTop = parseInt(window.getComputedStyle(images[i]).top, 10);
			 if(n + currentTop > 800) {
				 currentTop = - n - 200;
			 } 
			 images[i].style.top = currentTop + n + 'px';
		}
	}
}
