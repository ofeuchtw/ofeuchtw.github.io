const base = "rgb(20,20,20)"; //base color code 
const accent = "rgb(204, 134, 139)";	//accent color code 
const lightBase = false;
var grabbed = false;		//indicates whether ball should track cursor
var instruction1Displayed = true;
var instruction2Displayed = false;

var currentColor = base;
var currentAccent = accent;

var sidePanelWidth = 120;

//apply base and accent color
$("body").css("background-color",base);
$("h2").css("color",accent);
$("#sidePanel").css("background-color",accent);
$("#shadow").css("background","-webkit-linear-gradient(left, black, "+ accent + ")");

//set up canvas
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext('2d');

var width = canvas.width = 615;
var height = canvas.height = 300;

var ballX = width/2;
var ballY = height-25;

//set up hole coordinates
var holeX = width/3;
var holeY = height - 15;
var holeWidth = 70;
var holeHeight = 16;

var limit = 350;

//position layered elements
$("#instruction_1").css("left", width/2 - 50 + "px");
$("#instruction_2").css("left",width/2 + 50 + "px");

//set up second canvas
var canvas2 = document.querySelector("#canvas2");
var ctx2 = canvas2.getContext('2d');

var width2 = canvas2.width = 615;
var height2 = canvas2.height = 250;

//set up overlay
var overlay = document.querySelector("#overlay");
overlay.width = holeWidth+20;
overlay.height = 15;
$(overlay).css("left",holeX+"px");
var overlayCtx = overlay.getContext('2d');


$(document).ready(function() {

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

	 //fades out canvas and instructions on scroll, and sets hidden
	$(window).scroll(function(){

    	$("#canvas").css("opacity", 1 - $(window).scrollTop() / limit);
    	$("#overlay").css("opacity", 1 - $(window).scrollTop() / limit);
    	$(".instruction").css("opacity", 1 - $(window).scrollTop() / limit);

    	$("#canvas2").css("opacity", $(window).scrollTop() / 350 - 1.5);


    	currentColor = blend(base,"rgb(75,156,255)", Math.min($(window).scrollTop() / 700.0,1)); 
    	currentAccent = blend(accent,"rgb(252,193,64)", Math.min($(window).scrollTop() / 700.0,1));
    	$("body").css("background-color",currentColor);
    	$("h2").css("color",currentAccent);
		$("#sidePanel").css("background-color",currentAccent);
		$("#shadow").css("background","-webkit-linear-gradient(left, black, "+ currentAccent + ")");

    	resetCanvas();

    	resetCanvas2();

    	if($(window).scrollTop() >= limit) {
    		$(".c1").css("visibility",'hidden');
    		if(instruction1Displayed) {
    			$(".instruction").css("visibility",'hidden');
    		}
    		
    	} else {
    		$(".c1").css("visibility",'visible');
    		if(instruction1Displayed) {
    			$(".instruction").css("visibility",'visible');
    		}
    		
    	}

    	if($(window).scrollTop() <= 350) {
    		$("#canvas2").css("visibility",'hidden');
    	} else {
    		$("#canvas2").css("visibility",'visible');
    	}
 	 });

	$(canvas).on({

		//hides instruction 1
	  	mouseenter: function(){
			if(instruction1Displayed){
				$(canvas).off("mouseenter");
				$("#instruction_1").fadeOut(100);
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
		if(panelWidth >= sidePanelWidth * 2){
			contract();
		}
	});

	//expands side panel on hover, contracting canvas and shifting over elements
	function expand() {
		if(!sidePanelExpanded) {
			var timer = setInterval(shift,1.4);
			var t = 0;
			sidePanelExpanded = true; 
			function shift() {
				if(t < sidePanelWidth) {
					$("#shadow").css("right", 10 + 2 * t + 'px');
					$("#sidePanel").css("width", 30 + 2 * t + 'px');
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
			var t = sidePanelWidth * 2;
			sidePanelExpanded = false; 
			function shift() {
				if(t > 0) {
					$("#shadow").css("right", 10 + t + 'px');
					$("#sidePanel").css("width", 30 + t + 'px');
					t-= 2;
				} else {
					clearInterval(timer); 
				}
			}  
			
		}
	}

	//clears and redraws current canvas
	function resetCanvas() {
		ctx.translate(0,0);
		ctx.clearRect(0, 0, width, height);
		
		var grd=ctx.createRadialGradient(width/2,height,100,width/2,height,1000);

		grd.addColorStop(0,base);
		if(lightBase) {
			grd.addColorStop(1,darkenBy(base, .2));
		} else {
			grd.addColorStop(1,currentColor);
		}

		//background
		ctx.fillStyle = grd;
	    ctx.fillRect(0,0,width,height);
		
		//bottom surface
		if(lightBase) {
			ctx.fillStyle = darkenBy(base,.2);
		} else {
			ctx.fillStyle = lightenBy(base,.15);
		}
		ctx.beginPath();
		ctx.moveTo(0,height);
		ctx.lineTo(50,height-25);
		ctx.lineTo(width-50,height-25);
		ctx.lineTo(width,height);
		ctx.lineTo(0,height);
		ctx.fill();

		
		
		// //erase bottom surface under hole
		ctx.fillStyle = currentColor;	
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
		if(lightBase) {
			ctx.fillStyle = 'rgba(0,0,0,.25)';
		} else {
			ctx.fillStyle = 'rgba(255,255,255,.2)';
		}
		ctx.beginPath();
		ctx.lineTo(50,25);
		ctx.lineTo(width-50,25);
		ctx.lineTo(width,0);
		ctx.lineTo(0,0);
		ctx.fill();

		//left surface
		if(lightBase) {
			ctx.fillStyle = 'rgba(0,0,0,.1)';
		} else {
			ctx.fillStyle = 'rgba(255,255,255,.1)';
		}
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(50,25);
		ctx.lineTo(50,height-25);
		ctx.lineTo(0,height);
		ctx.fill();

		//right surface
		if(lightBase) {
			ctx.fillStyle = 'rgba(0,0,0,.1)';
		} else {
			ctx.fillStyle = 'rgba(255,255,255,.1)';
		}

		ctx.beginPath();
		ctx.moveTo(width,0);
		ctx.lineTo(width-50,25);
		ctx.lineTo(width-50,height-25);
		ctx.lineTo(width,height);
		ctx.fill();


		grd=ctx.createRadialGradient(holeX+(holeWidth/2),holeY+holeHeight,holeWidth/10,holeX+(holeWidth/2),holeY,holeWidth/2);
		if(lightBase) {
			grd.addColorStop(0,darkenBy(base, .15));
			grd.addColorStop(1,darkenBy(base, .6));
		} else {
			grd.addColorStop(0,base);
			grd.addColorStop(1,"black");
		}
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

		if(lightBase) {
			overlayCtx.fillStyle = darkenBy(base, .2);
		} else {
			overlayCtx.fillStyle = lightenBy(base, .15);
		}

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

	function resetCanvas2() {
		ctx2.translate(0,0);
		ctx2.clearRect(0, 0, width, height);

		var grd=ctx2.createRadialGradient(width/2,height,100,width/2,height,1000);
		grd.addColorStop(0,'#91dceb');
		grd.addColorStop(1,"cornflowerblue");

		//background
		ctx2.fillStyle = grd;
	    ctx2.fillRect(0,0,width,height);

	    //windowsill outline
	    ctx2.lineWidth = 40;
	    var grd2 = ctx2.createRadialGradient(width2/2,height2/2,100,width2/2,height2/2,200);
	    grd2.addColorStop(0, "#F0EAD6");
		grd2.addColorStop(1, "white");

		ctx2.strokeStyle = grd2;
		ctx2.strokeRect(0, 0, width2, height2);

		//left outline
		grd3 = ctx2.createRadialGradient(80,height2/2,20,80,height2/2,150);
		grd3.addColorStop(0, "white");
		grd3.addColorStop(1, "#F0EAD6");

		ctx2.fillStyle = grd3;
		ctx2.beginPath();
		ctx2.moveTo(20,20);
		ctx2.lineTo(40,40);
		ctx2.lineTo(40,height2-40);
		ctx2.lineTo(20,height2-20);
		ctx2.fill();

		//right outline
		grd3 = ctx2.createRadialGradient(width2 - 80,height2/2,20,width2 - 80,height2/2,150);
		grd3.addColorStop(0, "white");
		grd3.addColorStop(1, "#F0EAD6");

		ctx2.fillStyle = grd3;
		ctx2.beginPath();
		ctx2.moveTo(width2 - 20,20);
		ctx2.lineTo(width2 - 40,40);
		ctx2.lineTo(width2 - 40,height2-40);
		ctx2.lineTo(width2 - 20,height2-20);
		ctx2.fill();

		//bottom outline
		grd3 = ctx2.createRadialGradient(width2/2,height2 - 120,40,width2/2,height2 - 120,150);
		grd3.addColorStop(0, "white");
		grd3.addColorStop(1, "#F0EAD6");

		ctx2.fillStyle = grd3;
		ctx2.beginPath();
		ctx2.moveTo(20, height2 - 20);
		ctx2.lineTo(40, height2 - 40);
		ctx2.lineTo(width2 - 40,height2-40);
		ctx2.lineTo(width2 - 20,height2-20);
		ctx2.fill();

		//top outline
		//bottom outline
		grd3 = ctx2.createRadialGradient(width2/2, 120,40,width2/2,120,150);
		grd3.addColorStop(0, "white");
		grd3.addColorStop(1, "#F0EAD6");

		ctx2.fillStyle = grd3;
		ctx2.beginPath();
		ctx2.moveTo(20, 20);
		ctx2.lineTo(40, 40);
		ctx2.lineTo(width2 - 40, 40);
		ctx2.lineTo(width2 - 20, 20);
		ctx2.fill();
	}

	//draws the ball on the canvas at its current position
	function drawBall() {

		var grd=ctx.createRadialGradient(ballX-5,ballY-5,9,ballX,ballY,20);
		grd.addColorStop(0, accent);
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
			forceScroll();
		} else {
			velocity += .5;
			ballY+=velocity;
			resetCanvas();
			window.requestAnimationFrame(dropBallInHole);
		}
	}

	function forceScroll() {
		setInterval(scroll,10);
		var t= 0;
		function scroll() {
			if(t <= 500) {
				$(window).scrollTop(t);
				t+=5;
			} else {
				clearInterval(scroll);
			}
	
		}
		
	}
	
});

function degToRad(degrees) {
   return degrees * Math.PI / 180;
};

function blend(color,newColor,alpha) {
	var rgb = color.substring(4, color.length-1).replace(/ /g, '').split(',');
	var newColor = newColor.substring(4, newColor.length-1).replace(/ /g, '').split(',');

	for(var i = 0; i < 3; i++) {
		newColor[i] = Math.round(alpha * newColor[i] + ((1-alpha) * rgb[i]));
	}

	return "rgb(" + newColor[0] + "," + newColor[1] + ","+ newColor[2] + ")";
}

function addColor(color, newColor, alpha) {
	var shade = alpha * newColor;
	var rgb = color.substring(4, color.length-1).replace(/ /g, '').split(',');
	var newColor = [shade,shade,shade];

	for(var i = 0; i < 3; i++) {
		newColor[i] += ((1-alpha) * rgb[i]);
		newColor[i] = Math.round(newColor[i]);
	}

	return "rgb(" + newColor[0] + "," + newColor[1] + ","+ newColor[2] + ")";
}

function darkenBy(color,alpha) {
	return addColor(color,0,alpha);
}

function lightenBy(color, alpha) {
	return addColor(color,255,alpha);
}
