"use strict";

class AnimationClass
{
	constructor(p_root, p_parent, p_name)
	{
		this.myRoot = p_root;
		this.myParent = p_parent;
		this.myName = p_name;
		this.myCount = 0;
		this.myIncrement = 0;
		this.singleShot = false;
		this.done = false;
		this.running = false;
	}

	Start()
	{
		return false;
	}

	Update(p_this)
	{
	}

	BaseStop(p_this)
	{
		this.running = false;
	}

	SetSingleShot(p)
	{
		this.singleShot = p;
		this.done = false;
	}

	BaseStart(p_drawAnimationClass)
	{
		var result = true;

        if ((this.singleShot) && (this.done)) result = false; 
        if (this.singleShot) this.done = true;

        if (result)
        {
        	var asDrawAnimationClass = false;
        	
        	this.myCount = 0;
            this.myIncrement = 1;
            this.running = true;

            if (p_drawAnimationClass !== undefined)
            {
            	if (p_drawAnimationClass == true) asDrawAnimationClass = true;
            }

            if (asDrawAnimationClass)
            {
	            if (this.myRoot.myArgs.animationData !== undefined)
	            {
	                if (this.myRoot.myArgs.animationData.type !== undefined) this.myType = this.myRoot.myArgs.animationData.type;
	                if (this.myRoot.myArgs.animationData.timeout !== undefined) this.timeoutMs = this.myRoot.myArgs.animationData.timeout;
	            }
        	}
        }

        return result;
	}

	IsRunning()
	{
		return this.running;
	}
}

class GraphBaseClass
{
	constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
	{
        this.chartBackgroundColour = new ColourClass(237, 237, 237);
        this.animationEnabled = false;
        this.palette = [];
        this.myData = [];

        if (p_vbo_or_openGLRef.gl === undefined)
        {
            this.myModel = new ModelClass("myModel");
            this.myVBORef = p_vbo_or_openGLRef;
            this.myOpenGLRef = new DummyOpenGLClass(gl, p_vbo_or_openGLRef);
        }
        else
        {
            this.myModel = new ModelClass("myModel", p_vbo_or_openGLRef);
            this.myVBORef = null;
            this.myOpenGLRef = p_vbo_or_openGLRef;
        }

        this.myTextObject = new TextClass(this.myOpenGLRef);

        if (p_args === undefined) this.myArgs = null;
        else
        {
            this.myArgs = p_args;

            if (this.myArgs.animationEnabled !== undefined) this.animationEnabled = this.myArgs.animationEnabled;
        }    

        if (p_chart3DObjectRef === undefined) this.myChart3DRef = null;
        else this.myChart3DRef = p_chart3DObjectRef;

        this.animationName = "animation";
        this.myMouseMoveAnimationName = "mouseMoveAnimation";
	}

    GeneratePalette(p_numberOfColours, p_s, p_l)
    {
        this.palette = [];

        for (var i = 0; i < p_numberOfColours; i++)
        {
            var myColour = new ColourClass();

            myColour.SetFromHSL(360.0 * (myColour.BitReverse(i, p_numberOfColours) / p_numberOfColours), p_s, p_l);
            this.palette.push(myColour);
        }        
    }

    GetPaletteColour(p_index)
    {
        return this.palette[p_index % (this.palette.length)];
    }

    Convert3DToCanvasPosition(p_3dPosition, p_drawMatrix, p_projectionAndViewMatrix, p_canvasWidth, p_canvasHeight)
    {
        var result = {x: 0, y: 0};
        var myMatrix = new MatrixClass(true);

        myMatrix.CopyFrom(p_projectionAndViewMatrix);
        myMatrix.MultiplyBy(p_drawMatrix);
        
        var myScreenPos = myMatrix.Vec3NormMultiply(p_3dPosition);

        result.x = (myScreenPos.x * (p_canvasWidth / 2.0)) + (p_canvasWidth / 2.0);
        result.y = (myScreenPos.y * (p_canvasHeight / 2.0)) + (p_canvasHeight / 2.0);
        
        return result;
    }

    CreateBubble(p_vboRef, p_width, p_height, p_colour)
    {
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);

        myObject.AddCurvedQuad(p_width, p_height, 0.1, p_colour);

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();           
    }

    DrawGraphicTitle()
    {
        if (!this.myChart3DRef.headingAsHTML)
        {
            if (PropertyExists(this, "myArgs.title"))
            {
                if (PropertyExists(this, "myArgs.title.text"))
                {
                    var titleTextSize = this.myOpenGLRef.GetNativePixelSize();
                    var myColour = new ColourClass(0, 0, 0);
                    var fontName = "lucidaConsole18";
                    var fontFooter = "";

                    if (PropertyExists(this, "myArgs.title.style"))
                    {
                        if (PropertyExists(this, "myArgs.title.style.fontWeight"))
                        {
                            switch (this.myArgs.title.style.fontWeight)
                            {
                                case "bold":
                                    fontFooter = "_bold";
                                    break;
                            }
                        }

                        if (PropertyExists(this, "myArgs.title.style.fontSize"))
                        {
                            switch (this.myArgs.title.style.fontSize)
                            {
                                case "large":
                                    fontName = "lucidaConsole24";
                                    break;

                                case "x-large":
                                    fontName = "lucidaConsole36";
                                    break;

                                case "xx-large":
                                    fontName = "lucidaConsole72";
                                    break;

                                case "small":
                                    fontName = "lucidaConsole14";
                                    break;

                                case "x-small":
                                    fontName = "lucidaConsole12";
                                    break;

                                case "xx-small":
                                    fontName = "lucidaConsole10";
                                    break;
                            }
                        }

                        if (PropertyExists(this, "myArgs.title.style.color"))
                        {
                            if (this.myArgs.title.style.color.startsWith("#")) myColour.SetFromRGBHex(this.myArgs.title.style.color);
                        }
                    }

                    fontName += fontFooter;

                    var y = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, 0.9, null)).y;
                    var myText = this.myArgs.title.text;
                    var myTextWidth = this.myTextObject.GetTextWidth(fontName, myText, titleTextSize);
                    var myTextHeight = this.myTextObject.GetTextHeight(fontName, myText, titleTextSize);
                    var myObjectIndex = this.myTextObject.CreateText(fontName, myText, titleTextSize, titleTextSize, -1, 0, 1, myColour); 
                    var myTitle = this.myModel.AddChild("myTitle").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

                    // This sets it as far back as possible in the z buffer whilst still being displayed
                    myTitle.AddMatrix("posMatrix").SetTranslate(0, this.myOpenGLRef.GetRoundedY(y), 0.999);
                    myTitle.SetTextureTextValues(this.chartBackgroundColour);
                    myTitle.SetBypassMatrixes(true);
                }
            }
        }
    }

    MyMouseMoveHandler(p_event)
    {
        return false;
    }

    MyKeyDownHandler(p_event)
    {
        var walkSpeed = 0.1;
        var yawSpeed = 1.5;
        var refresh = true;
        
        switch (p_event.keyCode)
        {
              case 49:
                this.myOpenGLRef.cameraRotateMatrix.AddRotateX(-yawSpeed);
                break;

              case 50:
                this.myOpenGLRef.cameraRotateMatrix.AddRotateX(yawSpeed);
                break;
                
              case "A".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(walkSpeed, 0, 0);
                break;

              case "D".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(-walkSpeed, 0, 0);
                break;

              case "W".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, 0, walkSpeed);
                break;

              case "S".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, 0, -walkSpeed);
                break;

              case "Q".charCodeAt(0):
                this.myOpenGLRef.myYaw += yawSpeed;
                this.myOpenGLRef.cameraRotateMatrix.AddRotateY(-yawSpeed);
                break;

              case "E".charCodeAt(0):
                this.myOpenGLRef.myYaw -= yawSpeed;
                this.myOpenGLRef.cameraRotateMatrix.AddRotateY(yawSpeed);
                break;

              case "R".charCodeAt(0):
                this.myOpenGLRef.myYaw = 0;
                this.myOpenGLRef.cameraTranslateMatrix.LoadDefault();
                this.myOpenGLRef.cameraRotateMatrix.SetIdentity();
                break;
        }
        
        return refresh;
    }

    MyMouseWheelHandler(p_event)
    {
        return false;
    }

    CreateBubbleAndText(p_text, p_backgroundColour, p_font, p_textSize, p_parent, p_position)
    {
        const myTextWidth = this.myTextObject.GetTextWidth(p_font, p_text, p_textSize);
        const myTextHeight = this.myTextObject.GetTextHeight(p_font, p_text, p_textSize);
        const myBorderSize = 2 * this.myTextObject.GetTextHeight(p_font, " ", p_textSize);
        //var myObjectIndex = this.CreateBubble(this.myOpenGLRef.modelVBO, myTextWidth + 0.5, myTextHeight + 0.5, p_backgroundColour.AsVec3());
        var myObjectIndex = this.CreateBubble(this.myOpenGLRef.modelVBO, myTextWidth + myBorderSize, myTextHeight + myBorderSize, p_backgroundColour.AsVec3());
        const myBubble = p_parent.AddChild("bubble").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex).Enable(false);

        myBubble.SetUseLighting(false);
        myBubble.AddMatrix("posMatrix").AddTranslate(p_position.x, p_position.y, p_position.z);
        myBubble.AddMatrix("scaleMatrix").AddScale(1, 1, 1);

        myObjectIndex = this.myTextObject.CreateText(p_font, p_text, p_textSize, p_textSize, -1, 0, 1, new ColourClass(255, 255, 255));
        myBubble.AddChild("text").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
        myBubble.Child("text").AddMatrix("posMatrix").AddTranslate(0, 0, 0.001);
    }

    Render()
    {
        this.DrawGraphicTitle();
    }

    Draw()
    {
    }
}

class TestGraphClass extends GraphBaseClass
{
    constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
    {
        super(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef);
    }
}

class BarGraphBaseClass extends GraphBaseClass
{
	constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
	{
		var myS = 0.333, myL = 0.5;

		super(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef);

		this.inBarIndex = -1;
        this.NUMBER_OF_COLOURS = 16;

        this.W = 0.75;
        this.barWidth = this.W;
        this.barDepth = 0.5;
        this.myTextRatio = 1;
        this.topGapPercent = 15;
        this.labelGapPercent = 18;
        this.MAX_NORMALISED_X_TARGET = 0.9;
        this.xLabelNativePixelSize = null;

        this.myYScale = 1.0;

        // The original palette of 8 colours had an HSL of 0, 33%, 50%
        this.GeneratePalette(this.NUMBER_OF_COLOURS, myS, myL);
	}

	CommonRender(p_yMax)
	{
        // N is the minimum effective number of bars to determine spacing - E.g. If there are n bars of data then space will be allocated for N with N - n not visible
		var N = 10;
        var MAX_NORMALISED_Y_TARGET = 0.8;
		var i, n = this.myData.length;
		var myBars = this.myModel.Child("myBars");
        var myMatrix = new MatrixClass(true);
        var paperZ = -this.barDepth / 2;
        
        if (myBars == null)
        {
        	myBars = this.myModel.AddChild("myBars");

        	if (this.animationEnabled) myBars.AddAnimation(new BarGraphBase_AnimationClass(this, myBars, this.animationName)).SetSingleShot(true);
        }
        else myBars.RemoveChildren();

        var n_dashed = n;

        // Handle if less than N items ..
        if (n < N)
        {
            // This produced really wide bars
            //this.barWidth = (N + W - 1) / (n + ((n - 1) * ((1 / W) - 1)));

            // Try alternative strategy of going for a virtual minimum of N so for 1 bar, draw as if N but leave N - 1 blank
            n_dashed = N;
        }

        // Do scaling - xMax is the maximum x value from the right hand side of the rightmost bar - visible or not
        myMatrix.SetIdentity();
        myMatrix.MultiplyBy(this.myOpenGLRef.projectionMatrix);
        myMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);

        var d = this.Calculate_d(n_dashed, myMatrix, this.MAX_NORMALISED_X_TARGET);
        
        this.d_20 = this.Calculate_d(20, myMatrix, this.MAX_NORMALISED_X_TARGET);

        // Move the camera to the correct distance to get all the bars between +/- MAX_NORMALISED_X_TARGET
        this.myOpenGLRef.cameraTranslateMatrix.UpdateTranslateZ(-d).SaveDefault();
        this.myYScale = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, MAX_NORMALISED_Y_TARGET, 0)).y / this.CalculateYAxis(p_yMax).maxGraphValue;

        // myMatrix.Get(3, 3) is the current value of d
        if (n > 20) this.myTextRatio = (d - (this.barDepth / 2)) / (this.d_20 - (this.barDepth / 2));

        // Create the vertical axis
        var myX = this.myOpenGLRef.MapScreenPoint(new Vec3Class(this.MAX_NORMALISED_X_TARGET, 0, paperZ)).x;
        var p0 = new Vec3Class(-myX, 0, paperZ);
        var p1 = new Vec3Class(myX, 0, paperZ);
        var myLineObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        var myPoint = this.myOpenGLRef.MapScreenPoint(new Vec3Class(-1, 0, 0));
        var nativePixelSize = this.myOpenGLRef.GetNativePixelSize(paperZ);
        var fontName = "lucidaConsole18_bold";
        var myVerticals = this.myModel.Child("myVerticals");

        if (myVerticals == null) myVerticals = this.myModel.AddChild("myVerticals").SetUseLighting(false);
        else myVerticals.RemoveChildren();

        myLineObject.AddLine(p0, p1, new Vec3Class(1, 1, 1), new Vec3Class(0, 0, 1));

        // Draw the y-axis key values
        var myResults = this.CalculateYAxis(p_yMax);
        var numberOfLines = myResults.numberOfLines;
        var interval = myResults.interval;
        var decimalPlaces = myResults.decimalPlaces;
        var myPower = Math.pow(10, decimalPlaces);
        var xLeft = this.myOpenGLRef.MapScreenPoint(new Vec3Class(-1, 0, 0)).x;        

        for (i = 0; i <= numberOfLines; i++)
        {
            var myY = i * this.myYScale * interval;
            var myNumber = Math.round(i * interval * myPower) / myPower;
            var myText = myNumber.toString();

            if (decimalPlaces > 0)
            {
                if (myText.indexOf(".") == -1) myText += ".";

                var myIndex = myText.indexOf(".");

                while ((myText.length - myIndex) <= decimalPlaces) myText += "0";
            }

            var myTextWidth = this.myTextObject.GetTextWidth(fontName, myText, nativePixelSize);
            var myTextHeight = this.myTextObject.GetTextHeight(fontName, myText, nativePixelSize);
            //var targetX = this.myOpenGLRef.MapScreenPoint(new Vec3Class()).y;
            var targetX = -(myX + (myTextWidth / 2));
            var targetY = myY + (myTextHeight / 2);
            var actualX, actualY;

            actualX = this.myOpenGLRef.GetRoundedX(targetX, paperZ, this.myTextObject.GetTextWidth(fontName, myText, 1));
            actualY = this.myOpenGLRef.GetRoundedY(targetY, paperZ, this.myTextObject.GetTextHeight(fontName, myText, 1));

            myVerticals.AddChild("myVertical_" + i);
            var myObjectIndex = myLineObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
            
            var myLine = myVerticals.Child(i).AddChild("line").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);              
            myVerticals.Child(i).AddMatrix("posMatrix").AddTranslate(0, myY, 0);
            //myObjectIndex = this.myTextObject.CreateText(this.myTextObject.LucidaConsole72FontURL, myText, textSize, textSize, -1, 0, 1, new ColourClass(0, 0, 0));
            myObjectIndex = this.myTextObject.CreateText(fontName, myText, nativePixelSize, nativePixelSize, -1, 0, 1, new ColourClass(0, 0, 0));
            
            var myText = myVerticals.Child(i).AddChild("text").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            //myText.AddMatrix("posMatrix").AddTranslate(-myX - (myTextWidth / 2.0) - 0.35, 0.05 * this.myXScale, 0);
            myText.AddMatrix("posMatrix").AddTranslate(actualX, actualY - myY, paperZ);
            //myText.AddMatrix("scaleMatrix").AddScale(this.myTextRatio, this.myTextRatio, 1);
            myText.SetTextureTextValues(this.chartBackgroundColour);
        }

        super.Render();

        if (PropertyExists(this, "myArgs.xAxis.title"))
        {
            fontName = "lucidaConsole18_bold";
            
            var myPixelSize = this.myOpenGLRef.GetNativePixelSize(0);
            var myText = this.myArgs.xAxis.title.text;
            var myTextHeight = this.myTextObject.GetTextHeight(fontName, myText, myPixelSize);
            var myObjectIndex = this.myTextObject.CreateText(fontName, myText, myPixelSize, myPixelSize, -1, 0, 1, new ColourClass(0, 0, 0)); 
            var myXAxisTitle = this.myModel.AddChild("myXAxisTitle").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            var y = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, -1, 0)).y;

            y += myTextHeight / 2;
            y += myPixelSize * 4;
            myXAxisTitle.AddMatrix("posMatrix").SetTranslate(0, y, 0);
            myXAxisTitle.SetTextureTextValues(this.chartBackgroundColour);
        }

        if (PropertyExists(this, "myArgs.yAxis.title"))
        {
            fontName = "lucidaConsole18_bold";
            
            var myPixelSize = this.myOpenGLRef.GetNativePixelSize(0);
            var myText = this.myArgs.yAxis.title.text;
            var myTextHeight = this.myTextObject.GetTextHeight(fontName, myText, myPixelSize);
            var myObjectIndex = this.myTextObject.CreateText(fontName, myText, myPixelSize, myPixelSize, -1, 0, 1, new ColourClass(0, 0, 0)); 
            var myYAxisTitle = this.myModel.AddChild("myYAxisTitle").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            var v = this.myOpenGLRef.MapScreenPoint(new Vec3Class(-1, 0, 0));

            v.x += myTextHeight / 2;
            v.x += myPixelSize * 4;
            myYAxisTitle.AddMatrix("posMatrix").SetTranslate(v.x, v.y, v.z);
            myYAxisTitle.AddMatrix("rotateMatrix").AddRotateZ(90);
            myYAxisTitle.SetTextureTextValues(this.chartBackgroundColour);
        }

        return n_dashed;
	}

	GetBubbleZ()
	{
		return Math.sqrt((this.barWidth * this.barWidth) + (this.barDepth * this.barDepth)) / 2;
	}

	CreateBubbleAndText(p_text, p_backgroundColour, p_font, p_textSize, p_parent)
	{
        super.CreateBubbleAndText(p_text, p_backgroundColour, p_font, p_textSize, p_parent, new Vec3Class(0, 0, this.GetBubbleZ()));
	}

    CreateBar(p_vboRef, p_width, p_height, p_depth, p_colour)
    {
        p_width /= 2.0;
        p_depth /= 2.0;
        
        var p0 = new Vec3Class(-p_width, 0, p_depth);
        var p1 = new Vec3Class(p_width, 0, p_depth);
        var p2 = new Vec3Class(p_width, p_height, p_depth);
        var p3 = new Vec3Class(-p_width, p_height, p_depth);
        var p4 = new Vec3Class(-p_width, 0, -p_depth);
        var p5 = new Vec3Class(p_width, 0, -p_depth);
        var p6 = new Vec3Class(p_width, p_height, -p_depth);
        var p7 = new Vec3Class(-p_width, p_height, -p_depth);
        
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        
        myObject.AddQuad(p0, p1, p2, p3, p_colour, new Vec3Class(0, 0, 1));
        myObject.AddQuad(p5, p4, p7, p6, p_colour, new Vec3Class(0, 0, -1));
        myObject.AddQuad(p4, p0, p3, p7, p_colour, new Vec3Class(-1, 0, 0));
        myObject.AddQuad(p1, p5, p6, p2, p_colour, new Vec3Class(1, 0, 0));
        myObject.AddQuad(p3, p2, p6, p7, p_colour, new Vec3Class(0, 1, 0));
        myObject.AddQuad(p4, p5, p1, p0, p_colour, new Vec3Class(0, -1, 0));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();        
    }

    CreateCorner(p_object, p_segments, p_radius, p_colour, p_height)
    {
        var i;
        
        for (i = 0; i < p_segments; i++)
        {
            var theta = (i / p_segments) * Math.PI / 2.0;
            var thetaDash = ((i + 1) / p_segments) * Math.PI / 2.0;
            var p = new Array(4);
            var myNormals = new Array(2);
            
            p[0] = new Vec3Class(p_radius * Math.sin(theta), 0, p_radius * Math.cos(theta));
            p[1] = new Vec3Class(p_radius * Math.sin(thetaDash), 0, p_radius * Math.cos(thetaDash));
            p[2] = new Vec3Class(p_radius * Math.sin(thetaDash), p_height, p_radius * Math.cos(thetaDash));
            p[3] = new Vec3Class(p_radius * Math.sin(theta), p_height, p_radius * Math.cos(theta));

            myNormals[0] = new Vec3Class(Math.sin(theta), 0, Math.cos(theta));
            myNormals[1] = new Vec3Class(Math.sin(thetaDash), 0, Math.cos(thetaDash));

            p_object.AddVertex(p[0], p_colour, myNormals[0]);
            p_object.AddVertex(p[1], p_colour, myNormals[1]);
            p_object.AddVertex(p[2], p_colour, myNormals[1]);
            p_object.AddVertex(p[0], p_colour, myNormals[0]);
            p_object.AddVertex(p[2], p_colour, myNormals[1]);
            p_object.AddVertex(p[3], p_colour, myNormals[0]);
        }    
    }

    Create3DCorner(p_object, p_arc, p_segments, p_divisions, p_radius, p_flatShading, p_colour)
    {
        var p = new Array(4), myNormals = new Array(4);
        var quarterCircle = Math.PI / 2.0;
        var myAngle = quarterCircle - p_arc;

        for (var i = 0; i < p_segments; i++)
        {
            var theta = (i / p_segments) * quarterCircle;
            var thetaDash = ((i + 1) / p_segments) * quarterCircle;
            var z0 = p_radius * Math.cos(quarterCircle - theta);
            var z1 = p_radius * Math.cos(quarterCircle - thetaDash);
            var f0 = p_radius * Math.sin(quarterCircle - theta);
            var f1 = p_radius * Math.sin(quarterCircle - thetaDash);

            for (var j = 0; j < p_divisions; j++)
            {
                var gamma = myAngle + ((j / p_divisions) * p_arc);
                var y0 = Math.sin(gamma) * f0;
                var x0 = Math.cos(gamma) * f0;
                var y2 = Math.sin(gamma) * f1;
                var x2 = Math.cos(gamma) * f1;

                var gammaDash = myAngle + (((j + 1) / p_divisions) * p_arc);
                var y1 = Math.sin(gammaDash) * f0;
                var x1 = Math.cos(gammaDash) * f0;
                var y3 = Math.sin(gammaDash) * f1;
                var x3 = Math.cos(gammaDash) * f1;

                p[0] = new Vec3Class(-x1, y1, z0);
                p[1] = new Vec3Class(-x0, y0, z0);
                p[2] = new Vec3Class(-x2, y2, z1);
                p[3] = new Vec3Class(-x3, y3, z1);

                if (p_flatShading)
                {
                    myNormals[0] = CalculateNormal(p[0], p[1], p[2]);

                    if (i == (p_segments - 1)) p_object.AddTriangle(p[0], p[1], p[2], p_colour, myNormals[0]);
                    else p_object.AddQuad(p[0], p[1], p[2], p[3], p_colour, myNormals[0]);
                }
                else
                {
                    for (var k = 0; k < 4; k++)
                    {
                        myNormals[k] = new Vec3Class();
                        myNormals[k].CopyFrom(p[k]).Normalise();
                    }

                    if (i == (p_segments - 1))
                    {
                        p_object.AddVertex(p[0], p_colour, myNormals[0]);
                        p_object.AddVertex(p[1], p_colour, myNormals[1]);
                        p_object.AddVertex(p[2], p_colour, myNormals[2]);
                    }
                    else
                    {
                        p_object.AddVertex(p[0], p_colour, myNormals[0]);
                        p_object.AddVertex(p[1], p_colour, myNormals[1]);
                        p_object.AddVertex(p[2], p_colour, myNormals[2]);
                        p_object.AddVertex(p[0], p_colour, myNormals[0]);
                        p_object.AddVertex(p[2], p_colour, myNormals[2]);
                        p_object.AddVertex(p[3], p_colour, myNormals[3]);
                    }
                }
            }
        }   
    }

    CreateBevelledBar(p_vboRef, p_width, p_height, p_depth, p_colour, p_radius)
    {        
        var i, p_segments = 8, myObjectGroups = new ObjectGroupsClass(this.myOpenGLRef.gl), myMatrix = new MatrixClass();
        var showEdgesAsLines = false;

        p_width /= 2.0;
        p_depth /= 2.0;

        myObjectGroups.SetWorkingGroup("myGroup");
        myObjectGroups.CreateObject("front").ShowTrianglesAsLines(showEdgesAsLines);

        var p0 = new Vec3Class(p_radius - p_width, 0, p_depth);
        var p1 = new Vec3Class(p_width - p_radius, 0, p_depth);
        var p2 = new Vec3Class(p_width - p_radius, p_height, p_depth);
        var p3 = new Vec3Class(p_radius - p_width, p_height, p_depth);
        
        var p8 = new Vec3Class(-p_width, 0, p_radius - p_depth);
        var p9 = new Vec3Class(-p_width, 0, p_depth - p_radius);
        var p10 = new Vec3Class(-p_width, p_height, p_depth - p_radius);
        var p11 = new Vec3Class(-p_width, p_height, p_radius - p_depth);

        myObjectGroups.FindObject("front").AddQuad(p0, p1, p2, p3, p_colour, new Vec3Class(0, 0, 1));

        myObjectGroups.CreateObject("leftSide").ShowTrianglesAsLines(showEdgesAsLines);
        myObjectGroups.FindObject("leftSide").AddQuad(p8, p9, p10, p11, p_colour, new Vec3Class(-1, 0, 0));
        
        myObjectGroups.CreateObject("frontRightCorner").ShowTrianglesAsLines(showEdgesAsLines);
        this.CreateCorner(myObjectGroups.FindObject("frontRightCorner"), 4, p_radius, p_colour, p_height);        
        myObjectGroups.CopyObject("frontRightCorner", "frontLeftCorner");
        myMatrix.SetTranslate(p_width - p_radius, 0, p_depth - p_radius);
        myObjectGroups.FindObject("frontRightCorner").ApplyMatrix(myMatrix);
        
        myMatrix.SetTranslate(p_radius - p_width, 0, p_depth - p_radius);
        myMatrix.AddRotateY(270);
        myObjectGroups.FindObject("frontLeftCorner").ApplyMatrix(myMatrix);
        
        myMatrix.SetIdentity();
        myMatrix.AddRotateY(180);
        myObjectGroups.CopyObject("myGroup/*", "myBackGroup");
        myObjectGroups.ApplyMatrix("myBackGroup", myMatrix);

        myObjectGroups.SetWorkingGroup("topAndBottom");
        myObjectGroups.CreateObject("top");
        myObjectGroups.FindObject("top").AddCurvedQuad(p_width * 2, p_depth * 2, p_radius, new Vec3Class(1, 1, 1));
        myMatrix.SetTranslate(0, p_height, 0);
        myMatrix.AddRotateX(270);
        myObjectGroups.FindObject("top").ApplyMatrix(myMatrix);

        myObjectGroups.CreateObject("bottom");
        myObjectGroups.FindObject("bottom").AddCurvedQuad(p_width * 2, p_depth * 2, p_radius, new Vec3Class(1, 1, 1));
        myMatrix.SetIdentity();
        myMatrix.AddRotateX(90);
        myObjectGroups.FindObject("bottom").ApplyMatrix(myMatrix);

        var myVBOObjectIndex = myObjectGroups.MergeObject("*", "myAggregateGroup/myAggregateObject", true).AddToVBO(p_vboRef).GetVBOObjectIndex(); 

        if (showEdgesAsLines) myObjectGroups.FindObject("myAggregateObject").SetOpenGLObjectType(this.myOpenGLRef.gl.LINES);

        return myVBOObjectIndex;     
    }
        
	CreateBevelledBarRoundTop(p_vboRef, p_width, p_height, p_depth, p_colour, p_radius, p_roundTopEnabled)
    {
    	if (p_height == 0) return -1;
    	
        if (p_radius == 0) return this.CreateBar(p_vboRef, p_width, p_height, p_depth, p_colour);
        else
        {
            if (!p_roundTopEnabled) return this.CreateBevelledBar(p_vboRef, p_width, p_height, p_depth, p_colour, p_radius);
        }

        var i, p_segments = 8, myObjectGroups = new ObjectGroupsClass(this.myOpenGLRef.gl), myMatrix = new MatrixClass();
        var showEdgesAsLines = false;

        p_width /= 2.0;
        p_depth /= 2.0;
        p_height -= p_radius;

        // Is there any body that needs to be displayed underneath the curved top ?
        if (p_height > 0)
        {
            myObjectGroups.SetWorkingGroup("myGroup");
            myObjectGroups.CreateObject("front").ShowTrianglesAsLines(showEdgesAsLines);
            
            var p0 = new Vec3Class(p_radius - p_width, 0, p_depth);
            var p1 = new Vec3Class(p_width - p_radius, 0, p_depth);
            var p2 = new Vec3Class(p_width - p_radius, p_height, p_depth);
            var p3 = new Vec3Class(p_radius - p_width, p_height, p_depth);
            
            var p8 = new Vec3Class(-p_width, 0, p_radius - p_depth);
            var p9 = new Vec3Class(-p_width, 0, p_depth - p_radius);
            var p10 = new Vec3Class(-p_width, p_height, p_depth - p_radius);
            var p11 = new Vec3Class(-p_width, p_height, p_radius - p_depth);

            myObjectGroups.FindObject("front").AddQuad(p0, p1, p2, p3, p_colour, new Vec3Class(0, 0, 1));

            myObjectGroups.CreateObject("leftSide").ShowTrianglesAsLines(showEdgesAsLines);
            myObjectGroups.FindObject("leftSide").AddQuad(p8, p9, p10, p11, p_colour, new Vec3Class(-1, 0, 0));
            
            myObjectGroups.CreateObject("frontRightCorner").ShowTrianglesAsLines(showEdgesAsLines);
            this.CreateCorner(myObjectGroups.FindObject("frontRightCorner"), p_segments, p_radius, p_colour, p_height);        
            myObjectGroups.CopyObject("frontRightCorner", "frontLeftCorner");
            myMatrix.SetTranslate(p_width - p_radius, 0, p_depth - p_radius);
            myObjectGroups.FindObject("frontRightCorner").ApplyMatrix(myMatrix);
            
            myMatrix.SetTranslate(p_radius - p_width, 0, p_depth - p_radius);
            myMatrix.AddRotateY(270);
            myObjectGroups.FindObject("frontLeftCorner").ApplyMatrix(myMatrix);
            
            myMatrix.SetIdentity();
            myMatrix.AddRotateY(180);
            myObjectGroups.CopyObject("myGroup/*", "myBackGroup");
            myObjectGroups.ApplyMatrix("myBackGroup", myMatrix);
        }    

        myObjectGroups.SetWorkingGroup("topAndBottom");
        myObjectGroups.CreateObject("bottom");
        myObjectGroups.FindObject("bottom").AddCurvedQuad(p_width * 2, p_depth * 2, p_radius, new Vec3Class(1, 1, 1));
        myMatrix.SetIdentity();
        myMatrix.AddRotateX(90);
        myObjectGroups.FindObject("bottom").ApplyMatrix(myMatrix);

        // Create the curved top
        myObjectGroups.SetWorkingGroup("curvedTop");

        // Is the data value > 0 ?
        if ((p_height + p_radius) > 0)
        {
            var topFront = myObjectGroups.CreateObject("topFront");

            p_width -= p_radius;
            p_depth -= p_radius;

            for (i = 0; i < p_segments; i++)
            {
                var theta = (i / p_segments) * Math.PI / 2.0;
                var thetaDash = ((i + 1) / p_segments) * Math.PI / 2.0;
                var p = new Array(4);
                var myNormals = new Array(4);

                p[0] = new Vec3Class(-p_width, p_height + (p_radius * Math.sin(theta)), p_depth + (p_radius * Math.cos(theta)));
                p[1] = new Vec3Class(p_width, p_height + (p_radius * Math.sin(theta)), p_depth + (p_radius * Math.cos(theta)));
                p[2] = new Vec3Class(p_width, p_height + (p_radius * Math.sin(thetaDash)), p_depth + (p_radius * Math.cos(thetaDash)));
                p[3] = new Vec3Class(-p_width, p_height + (p_radius * Math.sin(thetaDash)), p_depth + (p_radius * Math.cos(thetaDash)));

                for (var j = 0; j < 4; j++)
                {
                    if (j < 2) myNormals[j] = new Vec3Class(0, Math.sin(theta), Math.cos(theta));
                    else myNormals[j] = new Vec3Class(0, Math.sin(thetaDash), Math.cos(thetaDash));

                    myNormals[j].Normalise();
                }

                topFront.AddQuadFromArrays(p, p_colour, myNormals);
            }

            myMatrix.SetRotateY(180);
            myObjectGroups.CopyObject("topFront", "topBack")
            myObjectGroups.FindObject("topBack").ApplyMatrix(myMatrix);

            myMatrix.SetTranslate(-p_width, 0, 0);
            myMatrix.AddRotateY(270);
            myMatrix.AddScale(p_depth / p_width, 1, 1);
            myMatrix.AddTranslate(0, 0, -p_depth);
            myObjectGroups.CopyObject("topFront", "topLeft")
            myObjectGroups.FindObject("topLeft").ApplyMatrix(myMatrix);

            myMatrix.SetRotateY(180);
            myObjectGroups.CopyObject("topLeft", "topRight")
            myObjectGroups.FindObject("topRight").ApplyMatrix(myMatrix);

            p_height += p_radius;

            var myObject = myObjectGroups.CreateObject("frontLeftCorner").ShowTrianglesAsLines(showEdgesAsLines);

            this.Create3DCorner(myObject, Math.PI / 2.0, p_segments, p_segments, p_radius, false, p_colour);
            myObjectGroups.CopyObject("frontLeftCorner", "frontRightCorner");
            myObjectGroups.CopyObject("frontLeftCorner", "backLeftCorner");
            myObjectGroups.CopyObject("frontLeftCorner", "backRightCorner");

            myMatrix.SetTranslate(-p_width, p_height - p_radius, p_depth);
            myObject.ApplyMatrix(myMatrix);

            myMatrix.SetTranslate(p_width, p_height - p_radius, p_depth);
            myMatrix.AddRotateY(90);
            myObjectGroups.FindObject("frontRightCorner").ApplyMatrix(myMatrix);

            myMatrix.SetTranslate(-p_width, p_height - p_radius, -p_depth);
            myMatrix.AddRotateY(270);
            myObjectGroups.FindObject("backLeftCorner").ApplyMatrix(myMatrix);

            myMatrix.SetTranslate(p_width, p_height - p_radius, -p_depth);
            myMatrix.AddRotateY(180);
            myObjectGroups.FindObject("backRightCorner").ApplyMatrix(myMatrix);

            // Do we need to compress the curved top ?
            if (p_height < p_radius)
            {
                myMatrix.SetTranslate(0, p_height / 2, 0);
                myMatrix.AddScale(1, p_height / p_radius, 1);
                myMatrix.AddTranslate(0, (p_radius / 2) - p_height, 0);
                myObjectGroups.FindObjectGroup("curvedTop").ApplyMatrix(myMatrix);
            }

            p_height -= p_radius;
        }

        p_height += p_radius;

        myObjectGroups.CreateObject("top").AddQuad(new Vec3Class(-p_width, p_height, p_depth), new Vec3Class(p_width, p_height, p_depth), new Vec3Class(p_width, p_height, -p_depth), new Vec3Class(-p_width, p_height, -p_depth), p_colour, new Vec3Class(0, 1, 0));
        
        var myVBOObjectIndex = myObjectGroups.MergeObject("*", "myAggregateGroup/myAggregateObject", true).AddToVBO(p_vboRef).GetVBOObjectIndex(); 

        if (showEdgesAsLines) myObjectGroups.FindObject("myAggregateGroup/myAggregateObject").SetOpenGLObjectType(this.myOpenGLRef.gl.LINES);

        p_vboRef.myOpenGLRef.AddObjectToDelete(myObjectGroups);

        return myVBOObjectIndex;     
    }

    CalculateYAxis(p_yMax)
    {
		var yMaxTemp = p_yMax;
		var multiplier = 1;
		var interval = 1.0;
		var decimalPlaces = 0;
		var numberOfLines = 10;
		var maxGraphValue = 0;

		while (yMaxTemp >= 10)
		{
			yMaxTemp /= 10;
			multiplier *= 10;
		}

		if (yMaxTemp >= 5)
		{
			interval = 0.5;
			numberOfLines = Math.floor(yMaxTemp * 2) + 1;
		}
		else
		{
			if (yMaxTemp >= 2)
			{
				interval = 0.2;
				numberOfLines = Math.floor(yMaxTemp * 5) + 1;
			}
			else
			{
				interval = 0.1;
				numberOfLines = Math.floor(yMaxTemp * 10) + 1;
			}
		}
	
		interval *= multiplier;
		maxGraphValue = numberOfLines * interval;

		if (interval < 1.0) decimalPlaces = 1;

		return {numberOfLines: numberOfLines, interval: interval, decimalPlaces: decimalPlaces, maxGraphValue: maxGraphValue};    	
    }

    MyKeyDownHandler(p_event)
    {
    	super.MyKeyDownHandler(p_event);

        switch (p_event.keyCode)
        {
              case "R".charCodeAt(0):
                var i, myBars = this.myModel.Child("myBars");
                var n = myBars.GetNumberOfChildren();

                for (i = 0; i < n; i++) myBars.Child(i).Child("xAxisLabel").Matrix("scaleMatrix").SetScale(1, 1, 1);

                break;
        }

        return true;
    }
	
	MyMouseWheelHandler(p_event)
    {
        var verticalSpeed = 0.25;

        this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, verticalSpeed * Math.sign(p_event.deltaY), 0);
        
        return true;
    }

    CalculateXMax(p_n_dashed)
    {
        return (this.barWidth * (p_n_dashed + ((p_n_dashed - 1) * ((1 / this.W) - 1)))) / 2;
    }

    Calculate_d(p_n_dashed, p_currentMatrixRef, p_normalisedXTarget)
    {
        var xMax = this.CalculateXMax(p_n_dashed);

        // myPoint is the maximum x and y value for the front of a bar - maxGraphValue is the maximum line to be displayed on the graph
        var myPoint = new Vec3Class(xMax, 0, this.barDepth / 2);
        var myNonNormalisedNewPoint = p_currentMatrixRef.Vec3Multiply(myPoint);
        var a = myNonNormalisedNewPoint.x;
        var b = -myPoint.z;
        var e = p_normalisedXTarget;
        var d = (a / e) - b;

        return d;
    }
}

class BarGraphBase_MouseAnimationClass extends AnimationClass
{
    constructor(p_root, p_parent, p_name)
    {
        super(p_root, p_parent, p_name);
        this.timeoutMs = 20;
        this.stopOnZero = false;
    }

    Start()
    {
        var result = false;

        if (this.BaseStart())
        {
            this.myParent.RemoveMatrix("matrix");
            this.myParent.AddMatrix("matrix");
            this.myIncrement = 4;
            this.stopOnZero = false;
            //setTimeout(this.Update, this.timeoutMs, this);
            this.myRoot.myChart3DRef.StartUpdate(this, this.timeoutMs);
            result = true;
        }

        return result;                  
    }

    Stop()
    {
        this.stopOnZero = true;
    }

    Resume()
    {
        this.stopOnZero = false;
    }

    Update(p_this)
    {
        var result = false;

        p_this.myCount += p_this.myIncrement;

        if (p_this.myCount == 360) p_this.myCount = 0;

        if ((p_this.myCount == p_this.myIncrement) && (p_this.stopOnZero)) p_this.BaseStop();
        else
        {
            p_this.myParent.Matrix("matrix").SetRotateY(p_this.myCount);
            result = true;
        }

        return result;
    }
}

class BarGraphBase_AnimationClass extends AnimationClass
{
    constructor(p_root, p_parent, p_name)
    {
        super(p_root, p_parent, p_name);
        this.timeoutMs = 20;
    }

    Start()
    {
        var result = false;

        // Adding the "true" parameter to get the animation type and speed from the report definition
        if (this.BaseStart(true))
        {
            this.myParent.RemoveMatrix("matrix");
            this.myParent.AddMatrix("matrix");
            this.myRoot.myChart3DRef.StartUpdate(this, this.timeoutMs);
            result = true;
        }

        return result;                  
    }

    Stop()
    {
        this.myParent.RemoveMatrix("matrix");
        this.BaseStop();
    }

    Update(p_this)
    {
        var result = false;

        p_this.myCount += p_this.myIncrement;

        if (p_this.myCount <= 100)
        {
            var myScale = p_this.myCount / 100;

            p_this.myParent.Matrix("matrix").SetScale(1, myScale, 1).AddRotateX(0.9 * (100 - p_this.myCount));
            result = true;
        }
        else p_this.Stop();

        return result;
    }
}

class BarGraphClass extends BarGraphBaseClass
{
    constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
    {
        var i;

        super(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef);

        this.minUnitWidths = [];

        //this.SetTestData();
        
        if (PropertyExists(this, "myArgs"))
        {
            for (i = 0; i < this.myArgs.data[0].dataPoints.length; i++)
            {
                var myData = this.myArgs.data[0].dataPoints[i];

                this.AddBar(myData.x.toString(), myData.y);
            }
        }
    }

    SetTestData()
    {
        var i, numberOfColumns = 10;

        this.myArgs.data[0].dataPoints = [];

        for (i = 0; i < numberOfColumns; i++)
        {
            var zz = i + 1;

            //if (i != 33) zz = 1;

            this.myArgs.data[0].dataPoints.push({x: i + 1, y: zz});
        }
    }   

    AddBar(p_xTag, p_value)
    {
        this.myData.push({xTag: p_xTag, value: p_value, backupMatrix: new MatrixClass()});
    }
    
    Render()
    {
        var i, n = this.myData.length;
        var yMax = 0;
        var textSize = 0.0175; 
        var myObjectIndex;
        var myRadius = 0;
        var myRoundTopEnabled = false;
        var myStyle = 0;

        // Get the yMax value
        for (i = 0; i < n; i++)
        {
            if (this.myData[i].value > yMax) yMax = this.myData[i].value;
        }

        var n_dashed = this.CommonRender(yMax);

        if (this.myArgs.style !== undefined) myStyle = this.myArgs.style;

        switch (myStyle)
        {
            case 1:
                myRadius = 0.1;
                break;

            case 2:
                myRadius = 0.1;
                myRoundTopEnabled = true;
                break;
        }

        this.xLabelNativePixelSize = this.myOpenGLRef.GetNativePixelSize(this.barDepth / 2);
        var xMax = this.CalculateXMax(n_dashed);
        var fontName = "lucidaConsole14_bold";

        // Create each bar and associated objects
        for(i = 0; i < n; i++)
        {
            var myColour = this.GetPaletteColour(i);
            
            myObjectIndex = this.CreateBevelledBarRoundTop(this.myOpenGLRef.modelVBO, this.barWidth, this.myData[i].value * this.myYScale, this.barDepth, myColour.AsVec3(), myRadius, myRoundTopEnabled);
            
            var myBar = this.myModel.Child("myBars").AddChild("myBar_" + i);
            var myBarGraphic = myBar.AddChild("myBarGraphic").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            var xlaX = ((this.barWidth / 2) - xMax) + (i * this.barWidth / this.W);
            
            myBar.AddMatrix("posMatrix").AddTranslate(xlaX, 0, 0);
            myBarGraphic.AddAnimation(new BarGraphBase_MouseAnimationClass(this, myBarGraphic, this.myMouseMoveAnimationName));
            
            // Create x-axis key values
            var myText = this.myData[i].xTag;

            if (PropertyExists(this, "myArgs.xAxis.suffix")) myText += this.myArgs.xAxis.suffix;

            var maxLabelsPerRow = 20;
            var numberOfLabelRows = Math.ceil(n / maxLabelsPerRow);

            myBar.xLabelText = myText;
            myBar.xLabelFont = fontName;
            myObjectIndex = this.myTextObject.CreateText(fontName, myText, this.xLabelNativePixelSize, this.xLabelNativePixelSize, -1, 0, 1, myColour);
            
            var xAxisLabel = myBar.AddChild("xAxisLabel").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            var totalPercent = this.topGapPercent + (this.labelGapPercent * (i % numberOfLabelRows));
            var targetX = xlaX;
            var actualX;

            actualX = this.myOpenGLRef.GetRoundedX(targetX, this.barDepth / 2, this.myTextObject.GetTextWidth(fontName, myText, 1));

            var labelYOffset = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, this.myOpenGLRef.T + ((totalPercent / 100) * (-1 - this.myOpenGLRef.T)), this.barDepth / 2)).y;
            var actualY = this.myOpenGLRef.GetRoundedY(labelYOffset, this.barDepth / 2, this.myTextObject.GetTextHeight(fontName, myText, 1));

            xAxisLabel.SetTextureTextValues(this.chartBackgroundColour);
            xAxisLabel.AddMatrix("posMatrix").AddTranslate(actualX - targetX, actualY, this.barDepth / 2);
            xAxisLabel.AddMatrix("keyPosMatrix").SetIdentity();
            xAxisLabel.AddMatrix("scaleMatrix").SetScale(1, 1, 1);

            // Create the bubble - start with the default value
            myText = this.myData[i].xTag + ": " + this.myData[i].value;

            if (PropertyExists(this, "myArgs.toolTip.content")) myText = this.GenerateToolTipText(i, this.myArgs.toolTip.content);

            this.CreateBubbleAndText(myText, myColour, "dosFont", 2 * this.myOpenGLRef.GetNativePixelSize(this.GetBubbleZ() + 0.001), myBar);
        }

        //if (this.myChart3DRef) this.TextureTest();
        /*var myGridObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        var gridColour = new Vec3Class(1, 1, 1);

        for (var x = -10; x <= 10; x++)
        {
            if (x == 0) gridColour.Set(1, 0, 0);
            else gridColour.Set(1, 1, 1);

            myGridObject.AddLine(new Vec3Class(x, 0, 10), new Vec3Class(x, 0, -10), gridColour, new Vec3Class(0, 1, 0));
        }

        for (var y = -10; y <= 10; y++)
        {
            myGridObject.AddLine(new Vec3Class(-10, 0, y), new Vec3Class(10, 0, y), gridColour, new Vec3Class(0, 1, 0));
        }

        myObjectIndex = myGridObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
        
        var myGrid = this.myModel.AddChild("myGrid").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

        myGrid.SetUseLighting(false);*/
        //myObjectIndex = myObject.AddToVBO(this.myVBORef).GetVBOObjectIndex();        
        //myVerticalAxis.SetVBO(this.myVBORef).SetVBOObjectIndex(myObjectIndex);
        
        // Scale the bars to fit the view
        //this.myYScale = 1;
        //myBars.AddMatrix("scaleMatrix").AddScale(this.myXScale, this.myYScale, 1);
    }

    TextureTest()
    {
        var myObjectGroups = new ObjectGroupsClass(this.myOpenGLRef.gl);
        var myFileName = "../Common/images/LucidaConsole72.png";
        var myTextureObject = this.myOpenGLRef.myTextureManager.LoadTexture(myFileName).textureRef;
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        var p0 = new Vec3Class(-1, -1, 0);
        var p1 = new Vec3Class(1, -1, 0);
        var p2 = new Vec3Class(1, 1, 0);
        var p3 = new Vec3Class(-1, 1, 0);

        var myFaceIndex = myObject.AddFace(0);
        myObject.AddQuad(p0, p1, p2, p3, new Vec3Class(1, 0, 0), new Vec3Class(0, 0, 1));

        var myObjectIndex = myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();           

        //this.myOpenGLRef.myTextureManager.AddTexture(myTextureObject, myFileName);

        var myTextureGraphic = this.myModel.AddChild("myTextureGraphic").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

        myTextureGraphic.AddMatrix("posMatrix").SetTranslate(0, 2, 1);
        myTextureGraphic.SetUseLighting(false);
        myObject.AddTexture(myFaceIndex, 1);
        //this.myModel.Child("myBars").Enable(false);
        //this.myModel.RemoveChild("myBars");
        //this.myModel.RemoveChild("myVerticals");
        //this.myModel.RemoveChild("myVerticalAxis");
        //this.myModel.RemoveChild("myTitle");
        //this.myModel.Display();
    }

    CreateKey(p_vboRef, p_colour)
    {
        var p_width = 0.01;
        
        var p0 = new Vec3Class(0, 0, 20);
        var p1 = new Vec3Class(0, 0, -20);
        
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        
        myObject.AddLine(p0, p1, p_colour, new Vec3Class(0, 1, 0));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();        
    }
    
    CreateQuad(p_vboRef, p_width, p_height, p_colour)
    {
        p_width /= 2.0;
        p_height /= 2.0;

        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        var p0 = new Vec3Class(-p_width, -p_height, 0);
        var p1 = new Vec3Class(p_width, -p_height, 0);
        var p2 = new Vec3Class(p_width, p_height, 0);
        var p3 = new Vec3Class(-p_width, p_height, 0);

        myObject.AddQuad(p0, p1, p2, p3, p_colour, new Vec3Class(0, 0, 1));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();           
    }
    
    Draw()
    {
        var localDraw = true;

        if (this.myModel.Child("myBars") != null)
        {
            if (this.animationEnabled) localDraw = !this.myModel.Child("myBars").Animation(this.animationName).Start();
        }
        
        if (localDraw) this.myModel.Draw();   
    }
    
    MyMouseMoveHandler(p_event)
    {
        // Need to take account of the canvas start postion, and also the scroll position
        // Mouse y position is 0 at the top
        // Can either use p_event.clientY - current canvas top (with scrolling)
        // or, use p_event.pageY - initial canvas top (with no scrolling yet)
        // Then we flip it so 0 is at the bottom of the canvas
        var myBars = this.myModel.Child("myBars");

        if (myBars == null) return;

        var n = this.myModel.Child("myBars").GetNumberOfChildren();
        var myIndex = -1;
        var myWidth = this.myOpenGLRef.gl.canvas.width;
        var myHeight = this.myOpenGLRef.gl.canvas.height;
        var myCombinedMatrix = new MatrixClass(true);
        var flippedY = (myHeight - 1) - (p_event.clientY - this.myOpenGLRef.GetCanvasTop());
        var redrawRequired = false;

        myCombinedMatrix.CopyFrom(this.myOpenGLRef.projectionMatrix);
        myCombinedMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);

        for (var i = 0; i < n; i++)
        {
            // Decide where to get the current draw matrix for this bar from
            var myDrawMatrixRef = null;
            
            if (myBars.Child(i).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).IsRunning()) myDrawMatrixRef = this.myData[i].backupMatrix;
            else myDrawMatrixRef = myBars.Child(i).currentDrawMatrix;

            // These are the 3D co-ordinates of the boundaries of each bar before any local draw matrix is applied
            var myVertexLowerLeft = new Vec3Class(-this.barWidth / 2, 0, this.barDepth / 2);
            var myVertexUpperRight = new Vec3Class(this.barWidth / 2, this.myData[i].value * this.myYScale, this.barDepth / 2);

            // These are the boundaries of each bar as they appear on the 2D physical canvas
            var myCanvasPositionLowerLeft = this.Convert3DToCanvasPosition(myVertexLowerLeft, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);
            var myCanvasPositionUpperRight = this.Convert3DToCanvasPosition(myVertexUpperRight, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);

            if (p_event.clientX >= myCanvasPositionLowerLeft.x)
            {
                if (p_event.clientX <= myCanvasPositionUpperRight.x)
                {
                    if (flippedY >= myCanvasPositionLowerLeft.y)
                    {
                        if (flippedY <= myCanvasPositionUpperRight.y)
                        {
                            myIndex = i;
                            break;
                        }
                    }
                }
            }
        }

        if (myIndex >= 0)
        {
            // In a bar area - were we outside of one before ?
            if (this.inBarIndex == -1)
            {
                // Yes
                var myMatrix = new MatrixClass(true);
                
                myMatrix.MultiplyBy(this.myOpenGLRef.projectionMatrix);
                myMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);
                 
                var myY = (2.0 * flippedY / myHeight) - 1.0;
                var wDash = myMatrix.Get(3, 3);
                var targetY = ((myY * wDash) - myMatrix.Get(1, 3)) / myMatrix.Get(1, 1);
                var myBubble = this.myModel.Child("myBars").Child(myIndex).Child("bubble");
                var actualY = this.myOpenGLRef.GetRoundedY(targetY, myBubble.Matrix("posMatrix").Get(2, 3), 0);
                
                this.inBarIndex = myIndex;
                myBubble.Matrix("posMatrix").UpdateTranslateY(actualY);
                myBubble.Enable(true);
                this.myData[myIndex].backupMatrix.CopyFrom(myBars.Child(myIndex).currentDrawMatrix);

                var myAnimation = myBars.Child(myIndex).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName);

                if (myAnimation.IsRunning()) myAnimation.Resume();
                else myAnimation.Start();

                redrawRequired = true;
            }
        }
        else
        {
            // Not in a bar area - were we in one before ?
            if (this.inBarIndex >= 0)
            {
                // Yes
                myBars.Child(this.inBarIndex).Child("bubble").Enable(false);
                myBars.Child(this.inBarIndex).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).Stop();
                this.inBarIndex = -1;
                redrawRequired = true;
            }
        }

        return redrawRequired;
    }

    GenerateToolTipText(p_index, p_toolTipContent)
    {
        var myText = "";
        var i;
        var myKey = "";
        var gettingKey = false;

        for (i = 0; i < p_toolTipContent.length; i++)
        {
            switch (p_toolTipContent[i])
            {
                case "{":
                    gettingKey = true;
                    myKey = "";
                    break;

                case "}":
                    gettingKey = false;
                    myText += this.myArgs.data[0].dataPoints[p_index][myKey];
                    break;

                default:
                    if (gettingKey) myKey += p_toolTipContent[i];
                    else myText += p_toolTipContent[i];
            }
        }

        return myText;
    }

    ProcessForwardAndBackward(p_distance)
    {
        this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, 0, p_distance);

/*        var currentUnitWidth = this.myOpenGLRef.projectionMatrix.Get(0, 0) / ((-this.myOpenGLRef.viewMatrix.Get(2, 3)) - (this.barDepth / 2));
        var numberOfLabelRows = 4;
        var myMatrix = new MatrixClass(); 

        myMatrix.SetIdentity();
        myMatrix.MultiplyBy(this.myOpenGLRef.projectionMatrix);
        myMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);

        for (var i = 0; i < 4; i++)
        {
            var myUnitWidth = this.myOpenGLRef.projectionMatrix.Get(0, 0) / (this.Calculate_d(30 * (i + 1), this.myOpenGLRef.projectionMatrix, 0.9) - (this.barDepth / 2));

            if (currentUnitWidth >= myUnitWidth)
            {
                numberOfLabelRows = i + 1;
                break;
            }
        }*/
        var numberOfLabelRows = 1;
        var myBars = this.myModel.Child("myBars");
        var n = myBars.GetNumberOfChildren();
        var myTextRatio = this.myOpenGLRef.GetNativePixelSize(this.barDepth / 2) / this.xLabelNativePixelSize;

        for (var i = 0; i < n; i++)
        {
            var myBar = myBars.Child(i);
            var targetX = myBar.Matrix("posMatrix").Get(0, 3);
            var actualX = this.myOpenGLRef.GetRoundedX(targetX, this.barDepth / 2, this.myTextObject.GetTextWidth(myBar.xLabelFont, myBar.xLabelText, 1));
            var xAxisLabel = myBar.Child("xAxisLabel");
            var totalPercent = this.topGapPercent + (this.labelGapPercent * (i % numberOfLabelRows));
            var labelYOffset = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, this.myOpenGLRef.T + ((totalPercent / 100) * (-1 - this.myOpenGLRef.T)), this.barDepth / 2)).y;
            var actualY = this.myOpenGLRef.GetRoundedY(labelYOffset, this.barDepth / 2, this.myTextObject.GetTextHeight(myBar.xLabelFont, myBar.xLabelText, 1));

            xAxisLabel.Matrix("posMatrix").UpdateTranslateX(actualX - targetX);
            xAxisLabel.Matrix("posMatrix").UpdateTranslateY(actualY);
            xAxisLabel.Matrix("scaleMatrix").SetScale(myTextRatio, myTextRatio, 1);
        }
    }

    MyKeyDownHandler(p_event)
    {
        var walkSpeed = 0.1;
        var refresh = true;
        
        switch (p_event.keyCode)
        {
              case "W".charCodeAt(0):
                this.ProcessForwardAndBackward(walkSpeed);
                break;

              case "S".charCodeAt(0):
                this.ProcessForwardAndBackward(-walkSpeed);
                break;

                default:
                    refresh = super.MyKeyDownHandler(p_event);

        }
        
        return refresh;
    }
}

class PieGraphClass extends GraphBaseClass
{
	constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
	{
		super(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef);
        this.GeneratePalette(16, 0.333, 0.4);
        this.myRadius = 1.5;
        this.myDepth = 0.25;
        this.inPiePieceIndex = -1;
        
        var i, totalValues = 0.0;

        if (PropertyExists(this, "myArgs"))
        {
            for (i = 0; i < this.myArgs.data[0].dataPoints.length; i++)
            {
                let myData = this.myArgs.data[0].dataPoints[i];

                this.AddPiePiece(myData.label.toString(), myData.y);
            }

            for (i = 0; i < this.myData.length; i++) totalValues += this.myData[i].value;

            for (i = 0; i < this.myData.length; i++)
            {
            	this.myData[i].subtendedAngle = 360.0 * (this.myData[i].value / totalValues);

            	if (i == 0) this.myData[i].startAngle = 0.0;
            	else this.myData[i].startAngle = this.myData[i - 1].startAngle + this.myData[i - 1].subtendedAngle;
            }

            if (this.myArgs.animationEnabled !== undefined)
            {
            	if (this.myArgs.animationEnabled == true) this.animationEnabled = true;
            }
        }
    }
    
    AddPiePiece(p_xTag, p_value)
    {
        this.myData.push({xTag: p_xTag, value: p_value, startAngle: 0.0, subtendedAngle: 0.0});
    }

	Render()
	{
		var i, n = this.myData.length;
		var myPie = this.myModel.AddChild("myPie");
        var myKeys = this.myModel.AddChild("myKeys").SetUseLighting(false);
		const numberOfSegments = 256;
		var myClockWise = false;
        var textSize = 0.0175 / 2; 
        var fontName = "lucidaConsole14";
        var nativePixeSize = this.myOpenGLRef.GetNativePixelSize(0);

        super.Render();

        if (this.animationEnabled) myPie.AddAnimation(new PieGraph_AnimationClass(this, myPie, this.myAnimationName)).SetSingleShot(true);

        for (i = 0; i < n; i++)
        {
            var myColour = this.GetPaletteColour(i); 
            var myObjectIndex = this.CreatePiePiece(this.myOpenGLRef.modelVBO, this.myData[i].startAngle, this.myData[i].startAngle + this.myData[i].subtendedAngle, numberOfSegments, this.myRadius, this.myDepth, myColour.AsVec3(), myClockWise);
            
            var myPiePiece = myPie.AddChild("myPiePiece_" + i).SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

            if (this.animationEnabled)
            {
	        	if (this.myArgs.animationData !== undefined)
	        	{
	        		if (this.myArgs.animationData.type !== undefined)
	        		{
	        			if (this.myArgs.animationData.type == 0) myPiePiece.Enable(false);
	        		}
	        	}
            }

            myPiePiece.AddAnimation(new PieGraph_MouseAnimationClass(this, myPiePiece, this.myMouseMoveAnimationName));

            var myKey = myKeys.AddChild("myKey_" + i)
            
            var myText = this.myData[i].xTag;

            if (this.myArgs != null)
            {
                if (this.myArgs.axisX !== undefined)
                {
                    if (this.myArgs.axisX.suffix !== undefined) myText += this.myArgs.axisX.suffix;
                }
            }

            myObjectIndex = this.myTextObject.CreateText(fontName, myText, nativePixeSize, nativePixeSize, -1, 0, 1, myColour);
            
            var myTextWidth = this.myTextObject.GetTextWidth(fontName, myText, nativePixeSize);
            var myTextHeight = this.myTextObject.GetTextHeight(fontName, myText, nativePixeSize);
            var myLabelRadius = 1.75;
            var myLabelAngle = DegreesToRadians(this.myData[i].startAngle + (this.myData[i].subtendedAngle / 2));
            var labelX = myLabelRadius * Math.cos(myLabelAngle);
            var labelY = myLabelRadius * Math.sin(myLabelAngle);
            var dx = Math.cos(myLabelAngle) / Math.sqrt(2);
            var dy = Math.sin(myLabelAngle) / Math.sqrt(2);

            dx = Math.max(Math.min(dx, 0.5), -0.5);
            dy = Math.max(Math.min(dy, 0.5), -0.5);

            var xOffset = dx * myTextWidth / 2;
            var yOffset = dy * myTextHeight / 2;

        	var myLabel = myKey.AddChild("text").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
        	myLabel.AddMatrix("posMatrix").SetTranslate(labelX + xOffset, labelY + yOffset, 0);
        	myLabel.SetTextureTextValues(this.chartBackgroundColour);

        	// Create the bubble
            myText = this.myData[i].xTag + ": " + this.myData[i].value;

            if (PropertyExists(this, "myArgs.toolTip.content")) myText = this.GenerateToolTipText(i, this.myArgs.toolTip.content);

            dy = Math.sin(myLabelAngle) * this.myRadius;

            if (Math.cos(myLabelAngle) >= 0) dx = 3;
            else dx = -3;
			
			this.CreateBubbleAndText(myText, myColour, "dosFont", textSize, myKey, new Vec3Class(dx, dy, (this.myDepth / 2) + 0.001));
        }
	}

	Draw()
	{
		var localDraw = true;

		if (this.animationEnabled) localDraw = !this.myModel.Child("myPie").Animation(this.myAnimationName).Start();
		
		if (localDraw) this.myModel.Draw();
	}

	AnimationTimer(p_this)
	{
		switch (p_this.myArgs.animationData.type)
		{
			case 0:
				p_this.myModel.Child("myPie").Child(p_this.animationData.currentIndex++).Enable(true);
				p_this.myModel.Draw();

				if (p_this.animationData.currentIndex < p_this.myData.length) setTimeout(p_this.AnimationTimer, p_this.myArgs.animationData.timeout, p_this);
				else p_this.animationData.done = true;
				break;

			case 1:
				var myScale = p_this.animationData.currentIndex / 100;

				p_this.myModel.Child("myPie").Matrix("sizeMatrix").SetScale(myScale, myScale, 1).AddRotateZ(3.6 * (100 - p_this.animationData.currentIndex));
				p_this.myModel.Draw();
				p_this.animationData.currentIndex++;

				if (p_this.animationData.currentIndex <= 100) setTimeout(p_this.AnimationTimer, p_this.myArgs.animationData.timeout, p_this);
				else p_this.animationData.done = true;
				break;
		}
	}

	CreatePiePiece(p_vboRef, p_startAngle, p_endAngle, p_segments, p_radius, p_depth, p_colour, p_clockWise)
	{
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        var segmentAngle = 360.0 / p_segments;
        var startSegment = Math.floor(p_startAngle / segmentAngle);
        var endSegment = Math.ceil(p_endAngle / segmentAngle) - 1;
        var i, x, y, theta;

        p_depth /= 2;

     	// Create sides
     	theta = DegreesToRadians(p_startAngle);
     	x = p_radius * Math.cos(theta);
     	y = p_radius * Math.sin(theta);
     	myObject.AddQuad(new Vec3Class(x, y, p_depth), new Vec3Class(0, 0, p_depth), new Vec3Class(0, 0, -p_depth), new Vec3Class(x, y, -p_depth), p_colour, new Vec3Class(Math.sin(theta), -Math.cos(theta), 0));

     	theta = DegreesToRadians(p_endAngle);
     	x = p_radius * Math.cos(theta);
     	y = p_radius * Math.sin(theta);
     	myObject.AddQuad(new Vec3Class(0, 0, p_depth), new Vec3Class(x, y, p_depth), new Vec3Class(x, y, -p_depth), new Vec3Class(0, 0, -p_depth), p_colour, new Vec3Class(-Math.sin(theta), Math.cos(theta), 0));

        // Create front
        for (i = startSegment; i <= endSegment; i++)
        {
        	theta = (i * DegreesToRadians(segmentAngle));

        	if (p_clockWise) theta = (2.0 * Math.PI) - theta;

        	var x0 = p_radius * Math.cos(theta);
        	var y0 = p_radius * Math.sin(theta);

        	var thetaDash = ((i + 1) * DegreesToRadians(segmentAngle));

        	if (p_clockWise) thetaDash = (2.0 * Math.PI) - thetaDash;

        	var x1 = p_radius * Math.cos(thetaDash);
        	var y1 = p_radius * Math.sin(thetaDash);

        	// First segment ?
        	if (i == startSegment)
        	{
        		let fraction = (p_startAngle - (i * segmentAngle)) / segmentAngle;
        		let p0 = new Vec3Class(x0, y0, 0);
        		let p1 = new Vec3Class(x1, y1, 0);
        		let result = Interpolate(p0, p1, fraction);

        		x0 = result.x;
        		y0 = result.y;
        	}

        	// Final segment ?
        	if (i == endSegment)
        	{
        		let fraction = (p_endAngle - (i * segmentAngle)) / segmentAngle;
        		let p0 = new Vec3Class(x0, y0, 0);
        		let p1 = new Vec3Class(x1, y1, 0);
        		let result = Interpolate(p0, p1, fraction);

        		x1 = result.x;
        		y1 = result.y;
        	}

        	let p0 = new Vec3Class(x0, y0, p_depth);
        	let p1 = new Vec3Class(x0, y0, -p_depth);
        	let p2 = new Vec3Class(x1, y1, -p_depth);
        	let p3 = new Vec3Class(x1, y1, p_depth);

        	let myNormals = [];

        	myNormals.push(new Vec3Class(x0, y0, 0));
        	myNormals.push(new Vec3Class(x1, y1, 0));

        	myNormals[0].Normalise();
        	myNormals[1].Normalise();

        	if (p_clockWise) 
			{
				myObject.AddTriangle(new Vec3Class(0, 0, p_depth), p3, p0, p_colour, new Vec3Class(0, 0, 1));
				myObject.AddTriangle(new Vec3Class(0, 0, -p_depth), p1, p2, p_colour, new Vec3Class(0, 0, -1));
			}
        	else
        	{
        		myObject.AddTriangle(new Vec3Class(0, 0, p_depth), p0, p3, p_colour, new Vec3Class(0, 0, 1));
        		myObject.AddTriangle(new Vec3Class(0, 0, -p_depth), p2, p1, p_colour, new Vec3Class(0, 0, -1));
        		myObject.AddVertex(p0, p_colour, myNormals[0]);
        		myObject.AddVertex(p1, p_colour, myNormals[0]);
        		myObject.AddVertex(p2, p_colour, myNormals[1]);
        		myObject.AddVertex(p0, p_colour, myNormals[0]);
        		myObject.AddVertex(p2, p_colour, myNormals[1]);
        		myObject.AddVertex(p3, p_colour, myNormals[1]);
        	}
        }

        //myObject.AddTriangle(new Vec3Class(0, 0, 0), new Vec3Class(1, 0, 0), new Vec3Class(1, 1, 0), p_colour, new Vec3Class(0, 0, 1));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex(); 
	}

   /* MyKeyDownHandler(p_event)
    {
        var walkSpeed = 0.1;
        var yawSpeed = 1.5;
        var refresh = true;
        
        switch (p_event.keyCode)
        {
              case 49:
                this.myOpenGLRef.cameraRotateMatrix.AddRotateX(-yawSpeed);
                break;

              case 50:
                this.myOpenGLRef.cameraRotateMatrix.AddRotateX(yawSpeed);
                break;
                
              case "A".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(walkSpeed, 0, 0);
                break;

              case "D".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(-walkSpeed, 0, 0);
                break;

              case "W".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, 0, walkSpeed);
                break;

              case "S".charCodeAt(0):
                this.myOpenGLRef.cameraTranslateMatrix.AddTranslate(0, 0, -walkSpeed);
                break;

              case "Q".charCodeAt(0):
                this.myOpenGLRef.myYaw += yawSpeed;
                this.myOpenGLRef.cameraRotateMatrix.AddRotateY(-yawSpeed);
                break;

              case "E".charCodeAt(0):
                this.myOpenGLRef.myYaw -= yawSpeed;
                this.myOpenGLRef.cameraRotateMatrix.AddRotateY(yawSpeed);
                break;
        }
        
        return refresh;
    } */

    MyMouseMoveHandler(p_event)
    {
        var n = this.myModel.Child("myPie").GetNumberOfChildren();
        var myIndex = -1;
        var myWidth = this.myOpenGLRef.gl.canvas.width;
        var myHeight = this.myOpenGLRef.gl.canvas.height;
        var myCombinedMatrix = new MatrixClass(true);
        var flippedY = (myHeight - 1) - (p_event.clientY - this.myOpenGLRef.GetCanvasTop());
        var redrawRequired = false;
        var myDrawMatrixRef = this.myModel.Child("myPie").currentDrawMatrix;

        myCombinedMatrix.CopyFrom(this.myOpenGLRef.projectionMatrix);
        myCombinedMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);

        var myVertexCentre = new Vec3Class(0, 0, 0);
        var myCanvasPositionCentre = this.Convert3DToCanvasPosition(myVertexCentre, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);

        for(var i = 0; i < n; i++)
        {
	        var myVertex_0 = new Vec3Class(this.myRadius * Math.cos(DegreesToRadians(this.myData[i].startAngle)), this.myRadius * Math.sin(DegreesToRadians(this.myData[i].startAngle)), this.myDepth / 2);
	        var myVertex_1 = new Vec3Class(this.myRadius * Math.cos(DegreesToRadians(this.myData[i].startAngle + this.myData[i].subtendedAngle)), this.myRadius * Math.sin(DegreesToRadians(this.myData[i].startAngle + this.myData[i].subtendedAngle)), this.myDepth / 2);
    	    var myCanvasPosition_0 = this.Convert3DToCanvasPosition(myVertex_0, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);
        	var myCanvasPosition_1 = this.Convert3DToCanvasPosition(myVertex_1, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);
            
            if (PointInTriangle(new Vec3Class(p_event.clientX, flippedY, 0), myCanvasPositionCentre, myCanvasPosition_0, myCanvasPosition_1))
            {
                myIndex = i;
                //alert(p_event.clientX + ", " + flippedY + ", " + myCanvasPositionCentre.x + ", " + myCanvasPositionCentre.y + ", " + myCanvasPosition_0.x + ", " + myCanvasPosition_0.y + ", " + myCanvasPosition_1.x + ", " + myCanvasPosition_1.y);
                break;
            }
        }

        if (myIndex >= 0)
        {
            // In a pie piece area - where we outside of one or in a different one before ?
            if (myIndex != this.inPiePieceIndex)
            {
                // Yes - were we in a different one before that needs to be closed ?
                if (this.inPiePieceIndex >= 0)
                {
                	this.myModel.Child("myKeys").Child(this.inPiePieceIndex).Child("bubble").Enable(false);
					this.myModel.Child("myPie").Child(this.inPiePieceIndex).Animation(this.myMouseMoveAnimationName).Stop();	                
                }

                // Calculate the position of the bubble
                var myMatrix = new MatrixClass(true);
                
                myMatrix.MultiplyBy(this.myOpenGLRef.projectionMatrix);
                myMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);
                 
                var z = this.myDepth / 2;
                var W = myMatrix.Get(3, 3) - z;
                var myHalfWidth = this.myOpenGLRef.myCanvas.width / 2;
                var myHalfHeight = this.myOpenGLRef.myCanvas.height / 2;
                var X_dash = (p_event.clientX - myHalfWidth) / myHalfWidth;
                var x = (W * X_dash) / myMatrix.Get(0, 0);
                var Y_dash = (flippedY - myHalfHeight) / myHalfHeight;
                var alpha = (myMatrix.Get(1, 2) * z) + myMatrix.Get(1, 3);
                var y = ((W * Y_dash) - alpha) / myMatrix.Get(1, 1);

                var myBubble = this.myModel.Child("myKeys").Child(myIndex).Child("bubble");
                
                this.inPiePieceIndex = myIndex;
                //myBubble.Matrix("posMatrix").Set(0, 3, x).Set(1, 3, y);
                myBubble.Enable(true);

                // Animate the pie piece
				this.myModel.Child("myPie").Child(myIndex).Animation(this.myMouseMoveAnimationName).Start();          
            }
        }
        else
        {
            // Not in a pie piece area - were we in one before ?
            if (this.inPiePieceIndex >= 0)
            {
                // Yes
                this.myModel.Child("myKeys").Child(this.inPiePieceIndex).Child("bubble").Enable(false);
                this.myModel.Child("myPie").Child(this.inPiePieceIndex).Animation(this.myMouseMoveAnimationName).Stop();
                this.inPiePieceIndex = -1;
            }
        }

        return redrawRequired;
    }

    GenerateToolTipText(p_index, p_toolTipContent)
    {
        var myText = "";
        var i;
        var myKey = "";
        var gettingKey = false;

        for (i = 0; i < p_toolTipContent.length; i++)
        {
            switch (p_toolTipContent[i])
            {
                case "{":
                    gettingKey = true;
                    myKey = "";
                    break;

                case "}":
                    gettingKey = false;
                    myText += this.myArgs.data[0].dataPoints[p_index][myKey];
                    break;

                default:
                    if (gettingKey) myKey += p_toolTipContent[i];
                    else myText += p_toolTipContent[i];
            }
        }

        return myText;
    }

}

class PieGraph_MouseAnimationClass extends AnimationClass
{
	constructor(p_root, p_parent, p_name)
	{
		super(p_root, p_parent, p_name);
		this.timeoutMs = 20;
		this.maxCount = 40;
	}

	Start()
	{
		var result = false;

		if (this.BaseStart())
		{
			this.myParent.RemoveMatrix("matrix");
		    this.myParent.AddMatrix("matrix");
			setTimeout(this.Update, this.timeoutMs, this); 
			result = true;
		}

		return result;            		
	}

	Stop()
	{
		this.myIncrement = -1;

		if (this.myCount >= 0) setTimeout(this.Update, this.timeoutMs, this);  
	}

	Update(p_this)
	{
		p_this.myCount += p_this.myIncrement;

		if ((p_this.myCount >= 0) && (p_this.myCount <= p_this.maxCount))
		{
			var myIndex = p_this.myParent.myName.lastIndexOf("_");

			if (myIndex >= 0)
			{
				myIndex = parseInt(p_this.myParent.myName.substring(myIndex + 1));

			    var myAngle = DegreesToRadians(p_this.myRoot.myData[myIndex].startAngle + (p_this.myRoot.myData[myIndex].subtendedAngle / 2));
			    var myDistance = 0.25 * p_this.myCount / 100;

			    p_this.myParent.Matrix("matrix").SetTranslate(myDistance * Math.cos(myAngle), myDistance * Math.sin(myAngle), 0);
				p_this.myRoot.myChart3DRef.Draw();

				setTimeout(p_this.Update, p_this.timeoutMs, p_this);
			}
		}
	}
}

class PieGraph_AnimationClass extends AnimationClass
{
	constructor(p_root, p_parent, p_name)
	{
		super(p_root, p_parent, p_name);
		this.timeoutMs = 20;
		this.maxCount = 40;
		this.myType = 0;
	}

	Start()
	{
		var result = false;

		// Adding the "true" parameter to get the animation type and speed from the report definition
		if (this.BaseStart(true))
		{
			this.myParent.RemoveMatrix("matrix");
		    this.myParent.AddMatrix("matrix");
			setTimeout(this.Update, this.timeoutMs, this);
			result = true;  
		}           	

		return result;	
	}

	Stop()
	{
		this.myParent.RemoveMatrix("matrix");
	}

	Update(p_this)
	{
		switch (p_this.myRoot.myArgs.animationData.type)
		{
			case 0:
				p_this.myParent.Child(p_this.myCount++).Enable(true);
				p_this.myRoot.myChart3DRef.Draw();

				if (p_this.myCount < p_this.myRoot.myData.length) setTimeout(p_this.Update, p_this.timeoutMs, p_this);
				else p_this.Stop();
				break;

			case 1:
				p_this.myCount += p_this.myIncrement;

				var myScale = p_this.myCount / 100;

			    p_this.myParent.Matrix("matrix").SetScale(myScale, myScale, 1).AddRotateZ(3 * 3.6 * (100 - p_this.myCount));
				//p_this.myRoot.myModel.Draw();
				p_this.myRoot.myChart3DRef.Draw();

				if (p_this.myCount < 100) setTimeout(p_this.Update, p_this.timeoutMs, p_this);
				else p_this.Stop();
				break;
		}
	}
}

class StackedColumnGraphClass extends BarGraphBaseClass
{
    constructor(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef)
    {
        var i, j;

        super(p_vbo_or_openGLRef, p_args, p_chart3DObjectRef);

        this.inSubBarIndex = -1;

        this.minXValue = null;
        this.maxXValue = null;
        this.xLabelTextYPosition = -0.2;    // ??
        this.xLabelTextHeight = 0;  // ??

        if (PropertyExists(this, "myArgs"))
        {
            // Get the min and max x-axis values - assume integer index
            for (i = 0; i < this.myArgs.data.length; i++)
            {
                for (j = 0; j < this.myArgs.data[i].dataPoints.length; j++)
                {
                    let myData = this.myArgs.data[i].dataPoints[j];
                    let myKey = myData.x;

                    if ((i == 0) && (j == 0))
                    {
                        this.minXValue = myKey;
                        this.maxXValue = myKey;
                    }
                    else
                    {
                        if (myKey < this.minXValue) this.minXValue = myKey;
                        if (myKey > this.maxXValue) this.maxXValue = myKey;
                    }
                }
            }

            // Create a slot for each x-axis value
            for (i = this.minXValue; i <= this.maxXValue; i++) this.myData.push({xTag: i, myDataValues: new StackedColumnDataClass()});

            // Loop over level in the stacked data
            for (i = 0; i < this.myArgs.data.length; i++)
            {
                if (this.myArgs.data[i].color !== undefined)
                {
                    let myColour = new ColourClass();

                    myColour.SetFromHSLString(this.myArgs.data[i].color);
                    this.palette[i].CopyFrom(myColour);
                }

                // Loop over each x/y datapoint for this data set
                for (j = 0; j < this.myArgs.data[i].dataPoints.length; j++)
                {
                    let myDataPoint = this.myArgs.data[i].dataPoints[j];
                    let myKey = myDataPoint.x;
                    let myIndex = myKey - this.minXValue;

                    this.myData[myIndex].myDataValues.AddDataValue(myDataPoint.y);
                }

                // Add any required zero entries if there was not a datapoint given
                for (j = 0; j < this.myData.length; j++)
                {
                    if (this.myData[j].myDataValues.GetNumberOfDataValues() < (i + 1)) this.myData[j].myDataValues.AddDataValue(0);
                }
            }
        }
    }
    
    Render()
    {
        var i, j, n = this.myData.length;
        var yMax = 0;
        var textSize = 0.0175; 
        var myObjectIndex;
        var myRadius = 0.1;
        var myRoundTopEnabled = false;
        var myStyle = 0;

        // Get the yMax value
        for (i = 0; i < n; i++)
        {
            var mySum = this.myData[i].myDataValues.GetDataValuesSum();

            if (mySum > yMax) yMax = mySum;
        }

        var n_dashed = this.CommonRender(yMax);

        var nativePixelSize = this.myOpenGLRef.GetNativePixelSize(this.barDepth / 2);
        var xMax = this.CalculateXMax(n_dashed);
        var fontName = "lucidaConsole14_bold";

        // Create each bar and associated objects
        for(i = 0; i < n; i++)
        {
            var myBar = this.myModel.Child("myBars").AddChild("myBar_" + i);
            var mySubBars = myBar.AddChild("mySubBars");

            var yOffset = 0;

            for (j = 0; j < this.myData[i].myDataValues.GetNumberOfDataValues(); j++)
            {
                var myColour = this.palette[j % this.palette.length];
                var myYValue = this.myData[i].myDataValues.GetDataValue(j);

                if (myYValue > 0)
                {
                    myObjectIndex = this.CreateBevelledBarRoundTop(this.myOpenGLRef.modelVBO, this.barWidth, myYValue * this.myYScale, this.barDepth, myColour.AsVec3(), myRadius, myRoundTopEnabled);
                    
                    var mySubBar = mySubBars.AddChild("mySubBar_" + j);
                    var myBarGraphic = mySubBar.AddChild("myBarGraphic").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

                    mySubBar.AddMatrix("verticalPosMatrix").AddTranslate(0, yOffset * this.myYScale, 0);
                    yOffset += myYValue;
                
                    myBarGraphic.AddAnimation(new BarGraphBase_MouseAnimationClass(this, myBarGraphic, this.myMouseMoveAnimationName));

                    var myText = this.myData[i].xTag + ": " + this.myData[i].myDataValues.GetDataValue(j);

                    if (PropertyExists(this, "myArgs.toolTip.content")) myText = this.GenerateToolTipText(i, j, this.myArgs.toolTip.content);

                    this.CreateBubbleAndText(myText, myColour, "dosFont", textSize, mySubBar);
                }
            }
           
            var xlaX = ((this.barWidth / 2) - xMax) + (i * this.barWidth / this.W);
            
            myBar.AddMatrix("posMatrix").AddTranslate(xlaX, 0, 0);
                        
            // Create x-axis key value
            myText = this.myData[i].xTag;

            var xKeyColour = new ColourClass(0, 0, 0);

            if (PropertyExists(this, "myArgs.xAxis.suffix")) myText += this.myArgs.xAxis.suffix;

            var maxLabelsPerRow = 20;
            var numberOfLabelRows = Math.ceil(n / maxLabelsPerRow);

            myObjectIndex = this.myTextObject.CreateText(fontName, myText, nativePixelSize, nativePixelSize, -1, 0, 1, xKeyColour);
            
            var xAxisLabel = myBar.AddChild("xAxisLabel").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);
            var totalPercent = this.topGapPercent + (this.labelGapPercent * (i % numberOfLabelRows));
            var targetX = xlaX;
            var actualX;

            actualX = this.myOpenGLRef.GetRoundedX(targetX, this.barDepth / 2, this.myTextObject.GetTextWidth(fontName, myText, 1));

            var labelYOffset = this.myOpenGLRef.MapScreenPoint(new Vec3Class(0, this.myOpenGLRef.T + ((totalPercent / 100) * (-1 - this.myOpenGLRef.T)), this.barDepth / 2)).y;
            var actualY = this.myOpenGLRef.GetRoundedY(labelYOffset, this.barDepth / 2, this.myTextObject.GetTextHeight(fontName, myText, 1));
            
            xAxisLabel.SetTextureTextValues(this.chartBackgroundColour);
            xAxisLabel.AddMatrix("posMatrix").AddTranslate(actualX - xlaX, actualY, this.barDepth / 2);
            xAxisLabel.AddMatrix("scaleMatrix").SetScale(this.myTextRatio, this.myTextRatio, 1);

            this.CreateBubbleAndText(myText, myColour, "dosFont", textSize, myBar);
        }
        
        // Draw the key for the different layers of the graph
        var myLayerLabels = this.myModel.AddChild("layerLabels");
        var myLayerLabelGap = 0.2;
        var overallWidthsSum = 0;
        var labelPairWidths = [];

        fontName = "lucidaConsole12";

        myLayerLabels.AddMatrix("posMatrix").SetTranslate(0, -1, 0);

        for (i = 0; i < this.myArgs.data.length; i++)
        {
            var myLayerLabelPair = myLayerLabels.AddChild("layerLabelPair_" + i);

            myObjectIndex = this.CreateBevelledBarRoundTop(this.myOpenGLRef.modelVBO, this.barWidth, 0.2, this.barDepth, this.palette[i].AsVec3(), myRadius, myRoundTopEnabled);
            
            var myShape = myLayerLabelPair.AddChild("myShape").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

            myShape.AddMatrix("posMatrix").SetTranslate(0, -0.1, 0);

            myText = this.myArgs.data[i].name;
            myObjectIndex = this.myTextObject.CreateText(fontName, myText, nativePixelSize, nativePixelSize, -1, 0, 1, xKeyColour);
            
            var myTextWidth = this.myTextObject.GetTextWidth(fontName, myText, textSize);
            var overallLabelPairWidth = this.barWidth + myLayerLabelGap + myTextWidth;

            var myLayerLabel = myLayerLabelPair.AddChild("layerLabel").SetVBO(this.myOpenGLRef.modelVBO).SetVBOObjectIndex(myObjectIndex);

            labelPairWidths.push(overallLabelPairWidth);
            myLayerLabel.AddMatrix("shiftRight").SetTranslate((overallLabelPairWidth - myTextWidth) / 2, 0, this.barDepth / 2);
            myLayerLabel.SetTextureTextValues(this.chartBackgroundColour);
            myShape.AddMatrix("shiftLeft").SetTranslate((this.barWidth - overallLabelPairWidth) / 2, 0, 0);
            overallWidthsSum += overallLabelPairWidth;
        }   

        var spareRoom = (2 * xMax) - overallWidthsSum;
        var A = spareRoom / this.myArgs.data.length;
        var dx = (A / 2) - xMax;

        for (i = 0; i < this.myArgs.data.length; i++)
        {
            myLayerLabels.Child(i).AddMatrix("posMatrix").SetTranslate(dx + (labelPairWidths[i] / 2), 0, 0);
            dx += labelPairWidths[i] + A;
        }
        /*var myGridObject = new OpenGLObjectClass();
        var gridColour = new Vec3Class(1, 1, 1);

        for (var x = -10; x <= 10; x++)
        {
            myGridObject.AddLine(new Vec3Class(x, 0, 10), new Vec3Class(x, 0, -10), gridColour, new Vec3Class(0, 1, 0));
        }

        for (var y = -10; y <= 10; y++)
        {
            myGridObject.AddLine(new Vec3Class(-10, 0, y), new Vec3Class(10, 0, y), gridColour, new Vec3Class(0, 1, 0));
        }

        myObjectIndex = myGridObject.AddToVBO(this.myVBORef).GetVBOObjectIndex();
        this.myModel.AddChild("myGrid").SetVBO(this.myVBORef).SetVBOObjectIndex(myObjectIndex);*/

        //myObjectIndex = myObject.AddToVBO(this.myVBORef).GetVBOObjectIndex();        
        //myVerticalAxis.SetVBO(this.myVBORef).SetVBOObjectIndex(myObjectIndex);
        
        // Scale the bars to fit the view
        //this.myYScale = 1;
        //myBars.AddMatrix("scaleMatrix").AddScale(this.myXScale, this.myYScale, 1);
        
        // Translate the X Axis keys to be under the axis line, and at the correct depth for the front of each bar
    }
    
    CreateKey(p_vboRef, p_colour)
    {
        var p_width = 0.01;
        
        var p0 = new Vec3Class(0, 0, 20);
        var p1 = new Vec3Class(0, 0, -20);
        
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
        
        myObject.AddLine(p0, p1, p_colour, new Vec3Class(0, 1, 0));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();        
    }
    
    CreateQuad(p_vboRef, p_width, p_height, p_colour)
    {
        p_width /= 2.0;
        p_height /= 2.0;

        var myObject = new OpenGLObjectClass(gl, gl.TRIANGLES);
        var p0 = new Vec3Class(-p_width, -p_height, 0);
        var p1 = new Vec3Class(p_width, -p_height, 0);
        var p2 = new Vec3Class(p_width, p_height, 0);
        var p3 = new Vec3Class(-p_width, p_height, 0);

        myObject.AddQuad(p0, p1, p2, p3, p_colour, new Vec3Class(0, 0, 1));

        return myObject.AddToVBO(p_vboRef).GetVBOObjectIndex();           
    }
    
    Draw()
    {
        var localDraw = true;

        if (this.animationEnabled) localDraw = !this.myModel.Child("myBars").Animation(this.animationName).Start();
        
        if (localDraw) this.myModel.Draw();   
    }
    
    GetBarStartX(p_index, p_width, p_projectionAndViewMatrix)
    {
        var myBars = this.myModel.Child("myBars");
        var myBar = myBars.Child(p_index);
        var myMatrix = new MatrixClass(true);
        var myVertex = new Vec3Class(-this.barWidth / 2, 0, this.barDepth / 2);

        myMatrix.CopyFrom(p_projectionAndViewMatrix);
        myMatrix.MultiplyBy(myBar.currentDrawMatrix);
        
        var myScreenPos = myMatrix.Vec3NormMultiply(myVertex);
        var myX = myScreenPos.x;
        
        myX *= (p_width / 2.0);
        myX += (p_width / 2.0);
        
        return myX;
    }

    GetBarEndX(p_index, p_width, p_projectionAndViewMatrix)
    {
        var myBars = this.myModel.Child("myBars");
        var myBar = myBars.Child(p_index);
        var myMatrix = new MatrixClass(true);
        var myVertex = new Vec3Class(this.barWidth / 2, 0, this.barDepth / 2);

        myMatrix.CopyFrom(p_projectionAndViewMatrix);
        myMatrix.MultiplyBy(myBar.currentDrawMatrix);
        
        var myScreenPos = myMatrix.Vec3NormMultiply(myVertex);
        var myX = myScreenPos.x;
        
        myX *= (p_width / 2.0);
        myX += (p_width / 2.0);
        
        return myX;
    }
    
    GetBarStartY(p_index, p_height, p_projectionAndViewMatrix)
    {
        var myBars = this.myModel.Child("myBars");
        var myBar = myBars.Child(p_index);
        var myMatrix = new MatrixClass(true);
        var myVertex = new Vec3Class(0, 0, this.barDepth / 2);

        myMatrix.CopyFrom(p_projectionAndViewMatrix);
        myMatrix.MultiplyBy(myBar.currentDrawMatrix);
        
        var myScreenPos = myMatrix.Vec3NormMultiply(myVertex);
        var myY = myScreenPos.y;
        
        myY *= (p_height / 2.0);
        myY += (p_height / 2.0);
        
        return myY;
    }

    GetBarEndY(p_index, p_height, p_projectionAndViewMatrix)
    {
        var myBars = this.myModel.Child("myBars");
        var myBar = myBars.Child(p_index);
        var myMatrix = new MatrixClass(true);
        var myVertex = new Vec3Class(0, this.myData[p_index].value * this.myYScale, this.barDepth / 2);

        myMatrix.CopyFrom(p_projectionAndViewMatrix);
        myMatrix.MultiplyBy(myBar.currentDrawMatrix);
        
        var myScreenPos = myMatrix.Vec3NormMultiply(myVertex);
        var myY = myScreenPos.y;
        
        myY *= (p_height / 2.0);
        myY += (p_height / 2.0);
        
        return myY;
    }

    MyMouseMoveHandler(p_event)
    {
        // Need to take account of the canvas start postion, and also the scroll position
        // Mouse y position is 0 at the top
        // Can either use p_event.clientY - current canvas top (with scrolling)
        // or, use p_event.pageY - initial canvas top (with no scrolling yet)
        // Then we flip it so 0 is at the bottom of the canvas
        var n = this.myModel.Child("myBars").GetNumberOfChildren();
        var myIndex = -1, mySubBarIndex = -1;
        var myWidth = this.myOpenGLRef.gl.canvas.width;
        var myHeight = this.myOpenGLRef.gl.canvas.height;
        var myCombinedMatrix = new MatrixClass(true);
        var flippedY = (myHeight - 1) - (p_event.clientY - this.myOpenGLRef.GetCanvasTop());
        var redrawRequired = false;
        var myBars = this.myModel.Child("myBars");

        myCombinedMatrix.CopyFrom(this.myOpenGLRef.projectionMatrix);
        myCombinedMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);

        for (var i = 0; i < n; i++)
        {
            var numberOfSubBars = myBars.Child(i).Child("mySubBars").GetNumberOfChildren();
            var myDrawMatrixRef = myBars.Child(i).Child("xAxisLabel").currentDrawMatrix;
            var myVertexLowerLeft = new Vec3Class(-this.barWidth / 2, (this.xLabelTextYPosition - (this.xLabelTextHeight / 2)) * this.myYScale, this.barDepth / 2);
            var myVertexUpperRight = new Vec3Class(this.barWidth / 2, (this.xLabelTextYPosition + (this.xLabelTextHeight / 2)) * this.myYScale, this.barDepth / 2);
            var myCanvasPositionLowerLeft = this.Convert3DToCanvasPosition(myVertexLowerLeft, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);
            var myCanvasPositionUpperRight = this.Convert3DToCanvasPosition(myVertexUpperRight, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);

            if (WithinRange({x: p_event.clientX, y: flippedY}, {x: myCanvasPositionLowerLeft.x, y: myCanvasPositionLowerLeft.y}, {x: myCanvasPositionUpperRight.x, y: myCanvasPositionUpperRight.y}))
            {
                myIndex = i;
            }

            if (myIndex == -1)
            {
                for (var j = 0; j < numberOfSubBars; j++)
                {
                    // Decide where to get the current draw matrix for this bar from
                    myDrawMatrixRef = null;
                    //var myDrawMatrixRef = myBars.Child(i).Child(j).currentDrawMatrix;
                    if (myBars.Child(i).Child("mySubBars").Child(j).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).running) myDrawMatrixRef = this.myData[i].myDataValues.GetBackupMatrix(j);
                    else myDrawMatrixRef = myBars.Child(i).Child("mySubBars").Child(j).currentDrawMatrix;

                    var myStartValue = 0
                    var myEndValue = this.myData[i].myDataValues.GetDataValueGreaterThanZero(j);

                    // These are the 3D co-ordinates of the boundaries of each bar before any local draw matrix is applied
                    myVertexLowerLeft = new Vec3Class(-this.barWidth / 2, myStartValue * this.myYScale, this.barDepth / 2);
                    myVertexUpperRight = new Vec3Class(this.barWidth / 2, myEndValue * this.myYScale, this.barDepth / 2);

                    myCanvasPositionLowerLeft = this.Convert3DToCanvasPosition(myVertexLowerLeft, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);
                    myCanvasPositionUpperRight = this.Convert3DToCanvasPosition(myVertexUpperRight, myDrawMatrixRef, myCombinedMatrix, myWidth, myHeight);

                    if (WithinRange({x: p_event.clientX, y: flippedY}, {x: myCanvasPositionLowerLeft.x, y: myCanvasPositionLowerLeft.y}, {x: myCanvasPositionUpperRight.x, y: myCanvasPositionUpperRight.y}))
                    {
                        myIndex = i;
                        mySubBarIndex = j;
                        break;
                    }
                }
            }
            
            if (myIndex >= 0) break;
        }

        if (myIndex >= 0)
        {
            // In a bar area - where we outside of one or in a different one before ?
            if ((myIndex != this.inBarIndex) || (mySubBarIndex != this.inSubBarIndex))
            {
                // Yes - were we in a different bar area before that needs to be closed ?
                if (this.inBarIndex >= 0)
                {
                    myBars.Child(this.inBarIndex).Child("mySubBars").Child(this.inSubBarIndex).Child("bubble").Enable(false);
                    myBars.Child(this.inBarIndex).Child("mySubBars").Child(this.inSubBarIndex).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).Stop();
                    console.log("Section 0");
                }

                var myMatrix = new MatrixClass(true);
                
                myMatrix.MultiplyBy(this.myOpenGLRef.projectionMatrix);
                myMatrix.MultiplyBy(this.myOpenGLRef.viewMatrix);
                 
                var myY = (2.0 * flippedY / myHeight) - 1.0;
                var wDash = myMatrix.Get(3, 3);
                var openGLY = ((myY * wDash) - myMatrix.Get(1, 3)) / myMatrix.Get(1, 1);
                var myBubble = null;

                openGLY -= this.myData[myIndex].myDataValues.GetDataValuesSum(mySubBarIndex - 1) * this.myYScale;

                if (mySubBarIndex >= 0) myBubble = myBars.Child(myIndex).Child("mySubBars").Child(mySubBarIndex).Child("bubble");
                else myBubble = myBars.Child(myIndex).Child("bubble");
                
                this.inBarIndex = myIndex;
                this.inSubBarIndex = mySubBarIndex;

                myBubble.Matrix("posMatrix").Set(1, 3, openGLY);
                myBubble.Enable(true);
                            
                if (mySubBarIndex >= 0)
                {
                    this.myData[myIndex].myDataValues.SetBackupMatrix(mySubBarIndex, myBars.Child(myIndex).Child("mySubBars").Child(mySubBarIndex).currentDrawMatrix);
                    myBars.Child(myIndex).Child("mySubBars").Child(mySubBarIndex).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).Start();
                }
                else redrawRequired = true;
            }
        }
        else
        {
            // Not in a bar area - were we in one before ?
            if (this.inBarIndex >= 0)
            {
                // Yes
                if (this.inSubBarIndex >= 0)
                {
                    myBars.Child(this.inBarIndex).Child("mySubBars").Child(this.inSubBarIndex).Child("myBarGraphic").Animation(this.myMouseMoveAnimationName).Stop();
                    myBars.Child(this.inBarIndex).Child("mySubBars").Child(this.inSubBarIndex).Child("bubble").Enable(false);
                }
                else
                {
                    myBars.Child(this.inBarIndex).Child("bubble").Enable(false);
                    redrawRequired = true;
                    console.log("Section 1");
                }

                this.inBarIndex = -1;
                this.inSubBarIndex = -1;
                //redrawRequired = true;
            }
        }

        return redrawRequired;
    }

    GenerateToolTipText(p_index, p_subIndex, p_toolTipContent)
    {
        var myText = "";
        var i;
        var myKey = "";
        var gettingKey = false;
        var myIndex = -1;

        for (i = 0; i < this.myArgs.data[p_subIndex].dataPoints.length; i++)
        {
            if (this.myArgs.data[p_subIndex].dataPoints[i].x == p_index)
            {
                myIndex = i;
                break;
            }
        }

        if (myIndex >= 0)
        {
            for (i = 0; i < p_toolTipContent.length; i++)
            {
                switch (p_toolTipContent[i])
                {
                    case "{":
                        gettingKey = true;
                        myKey = "";
                        break;

                    case "}":
                        gettingKey = false;

                        if (myKey == "z") myText += this.myArgs.data[p_subIndex].name;
                        else myText += this.myArgs.data[p_subIndex].dataPoints[myIndex][myKey];
                        break;

                    default:
                        if (gettingKey) myKey += p_toolTipContent[i];
                        else myText += p_toolTipContent[i];
                }
            }
        }

        return myText;
    }
}

class StackedColumnDataClass
{
    constructor()
    {
        this.myColour = null;
        this.myDataValues = [];
        this.myBackupMatrixes = [];
    }   

    AddDataValue(p)
    {
        this.myDataValues.push(p);
        this.myBackupMatrixes.push(new MatrixClass());

    }

    GetDataValue(p_index)
    {
        return this.myDataValues[p_index];
    }

    GetDataValueGreaterThanZero(p_index)
    {
        var valuesFound = 0;
        var result = -1;

        for (var i = 0; i < this.myDataValues.length; i++)
        {
            if (this.myDataValues[i] > 0)
            {
                if (valuesFound == p_index)
                {
                    result = this.myDataValues[i];
                    break;
                }
                else valuesFound++;
            }
        }

        return result;
    }

    GetNumberOfDataValues()
    {
        return this.myDataValues.length;
    }

    GetDataValuesSum(p_index)
    {
        var i, mySum = 0, myMaxIndex = this.myDataValues.length - 1;

        if (p_index !== undefined) myMaxIndex = p_index;

        for (i = 0; i <= myMaxIndex; i++) mySum += this.myDataValues[i];

        return mySum;
    }

    SetBackupMatrix(p_index, p_drawMatrixRef)
    {
        this.myBackupMatrixes[p_index].CopyFrom(p_drawMatrixRef);
    }

    GetBackupMatrix(p_index)
    {
        return this.myBackupMatrixes[p_index];
    }
}

class Chart3DClass
{
  	constructor(p_name, p_args)
  	{
        this.myTitleParagraph = null;
        this.updateRunning = false;
        this.timeoutMs = 20;
        this.updateList = [];
        this.logDrawTime = true;
        this.useVAO = false;
        this.headingAsHTML = false;
        this.useTextures = true;
        
        var myCanvasHeight = window.innerHeight;

        if (p_args.useVBO !== undefined)
        {
            if (p_args.useVBO == true) this.useVAO = false;
        }

        if (p_args.title !== undefined)
        {
            if (p_args.title.text !== undefined)
            {
                if (this.headingAsHTML)
                {
                    // Add the HTML title before the 3D graph
                    this.myTitleParagraph = document.createElement("p");
                    
                    var myTitleNode = document.createTextNode(p_args.title.text);
                    
                    for (var myKey in p_args.title.style) this.myTitleParagraph.style[myKey] = p_args.title.style[myKey];

                    this.myTitleParagraph.appendChild(myTitleNode);
                    document.body.appendChild(this.myTitleParagraph);
                    myCanvasHeight -= this.myTitleParagraph.getBoundingClientRect().bottom;
                }
            }
        }

        this.myOpenGLRef = new OpenGLClass(myCanvasHeight, this.useVAO, this.useTextures);
        this.myChart = null;
        this.myArgs = p_args;

        document.addEventListener("mousemove", (p_event) => {this.BaseMouseMoveHandler(p_event)});
        document.addEventListener('keydown', (p_event) => (this.BaseKeyDownHandler(p_event)));
        document.addEventListener('wheel', (p_event) => (this.BaseMouseWheelHandler(p_event)));
        document.addEventListener('mousedown', (p_event) => (this.BaseMouseDownHandler(p_event)));

        // This used to be in Render()
        if (this.myArgs.data[0].type === undefined) alert("Undefined chart type");
        else
        {
            switch (this.myArgs.data[0].type)
            {
                case "column":
                    this.myOpenGLRef.SetFor3D(-0.75);
                    this.myChart = new BarGraphClass(this.myOpenGLRef, this.myArgs, this);
                    break;

                case "stackedColumn":
                    this.myOpenGLRef.SetFor3D(-0.75);
                    this.myChart = new StackedColumnGraphClass(this.myOpenGLRef, this.myArgs, this);
                    break;

                case "pie":
                    this.myOpenGLRef.SetFor3D();
                    this.myChart = new PieGraphClass(this.myOpenGLRef, this.myArgs, this);
                    break;

                case "testChart":
                    this.myOpenGLRef.SetFor3D();
                    this.myChart = new TestGraphClass(this.myOpenGLRef, this.myArgs, this);
                    break;
            }
        }
    }

  	Render()
  	{
        this.myOpenGLRef.modelVBO.Clear();
        this.myChart.Render();
        this.myOpenGLRef.modelVBO.Enable();
  	}

    Draw()
    {
        //if (this.logDrawTime) console.time();
        this.myOpenGLRef.gl.clear(this.myOpenGLRef.gl.COLOR_BUFFER_BIT | this.myOpenGLRef.gl.DEPTH_BUFFER_BIT);
        this.myOpenGLRef.gl.viewport(0, 0, this.myOpenGLRef.gl.canvas.width, this.myOpenGLRef.gl.canvas.height);

        // Build the View Matrix from the Camera Translate and Rotate matrixes
        this.myOpenGLRef.viewMatrix.SetIdentity();
        this.myOpenGLRef.viewMatrix.MultiplyBy(this.myOpenGLRef.cameraTranslateMatrix);
        this.myOpenGLRef.viewMatrix.MultiplyBy(this.myOpenGLRef.cameraRotateMatrix);
        this.myOpenGLRef.myDiffuseLightPosition[0] = 100 * Math.sin(DegreesToRadians(this.myOpenGLRef.myYaw));
        this.myOpenGLRef.myDiffuseLightPosition[1] = 0;
        this.myOpenGLRef.myDiffuseLightPosition[2] = 100 * Math.cos(DegreesToRadians(this.myOpenGLRef.myYaw));

        var myVec3 = new Vec3Class(-this.myOpenGLRef.cameraTranslateMatrix.Get(0, 3), -this.myOpenGLRef.cameraTranslateMatrix.Get(1, 3), -this.myOpenGLRef.cameraTranslateMatrix.Get(2, 3));
        var myMatrix = new MatrixClass();

        myMatrix.SetRotateY(this.myOpenGLRef.myYaw);
        var myCameraVec3 = myMatrix.Vec3Multiply(myVec3);

        this.myOpenGLRef.myCameraPosition[0] = myCameraVec3.x;
        this.myOpenGLRef.myCameraPosition[1] = myCameraVec3.y;
        this.myOpenGLRef.myCameraPosition[2] = myCameraVec3.z;

        //gl.uniform3fv(myProgram.diffuseLightPositionUniformLocation, myDiffuseLightPosition);
        //gl.uniform3fv(myProgram.cameraPositionUniformLocation, myCameraPosition);
        
        ModelClass.drawArraysCalls = 0;
        this.myOpenGLRef.myActiveProgram.OnDraw();
        this.myChart.Draw();
        
        //if (this.logDrawTime) console.timeEnd();
        //console.log(ModelClass.drawArraysCalls + " drawArrays() calls")
        //var myKeys = this.myChart.myModel.Child("myKeys");
        
        //if (inBarIndex >= 0) myKeys.Child("myKey_" + inBarIndex).Child("text").Matrix("posMatrix").AddRotateZ(-5);
        //for (var i = 0; i < myKeys.GetNumberOfChildren(); i++) myKeys.Child("myKey_" + i).Child("text").Matrix("posMatrix").AddRotateZ(-1);
        
        //myAngle += 11.0;
        
        //StartTimer();
    }

    StartUpdate(p_animationObjectRef, p_timeoutMs)
    {
        if (!this.updateRunning)
        {
            var myTimeout = 20;

            if (p_timeoutMs !== undefined) myTimeout = p_timeoutMs;

            this.timeoutMs = myTimeout;
            this.updateRunning = true;
            setTimeout(this.Update, this.timeoutMs, this);
        }

        this.updateList.push(p_animationObjectRef);

        return (this.updateList.length - 1);
    }

    StopUpdate()
    {
        this.updateRunning = false;
    }

    Update(p_this)
    {
        var anyToRedraw = false;
        var toRemoveList = [];
        var tempArray = [];
        var i;

        // Run the update on all registered clients and then redraw the screen
        for (i = 0; i < p_this.updateList.length; i++)
        {
            var updateThis = p_this.updateList[i].Update(p_this.updateList[i]);

            if (updateThis) anyToRedraw = true;
            else toRemoveList.push(i);
        }

        if (anyToRedraw)
        {
            p_this.Draw();
            setTimeout(p_this.Update, p_this.timeoutMs, p_this);
        }
        else
        {
            p_this.StopUpdate();
        }

        for (i = 0; i < p_this.updateList.length; i++)
        {
            if (!toRemoveList.includes(i)) tempArray.push(p_this.updateList[i]);
        }

        p_this.updateList = [];

        for (i = 0; i < tempArray.length; i++) p_this.updateList[i] = tempArray[i];
    }

    BaseMouseMoveHandler(p_event)
    {
        if (this.myChart.MyMouseMoveHandler(p_event)) this.Draw(); 
    }

    BaseKeyDownHandler(p_event)
    {
        if (this.myChart.MyKeyDownHandler(p_event)) this.Draw();
    }

    BaseMouseWheelHandler(p_event)
    {
        if (this.myChart.MyMouseWheelHandler(p_event)) this.Draw();
    }

    BaseMouseDownHandler(p_event)
    {
        if (p_event.button == 2) alert(p_event.clientY + ", " + p_event.pageY + ", " + this.myOpenGLRef.GetCanvasTop());
    }
}

class ColourClass
{
    constructor(p_r, p_g, p_b)
    {
        this.red = 0.0;
        this.green = 0.0;
        this.blue = 0.0;

        if (p_r !== undefined) this.red = p_r;
        if (p_g !== undefined) this.green = p_g;
        if (p_b !== undefined) this.blue = p_b;
    }

    SetFromHSL(p_h, p_s, p_l)
    {
        // p_h is in degrees, p_s and p_l are between 0 and 1 for 0 to 100%
        var c = (1.0 - Math.abs((2.0 * p_l) - 1.0)) * p_s;
        var x;
        var m = p_l - (c / 2.0);
        var r_dashed = 0.0;
        var g_dashed = 0.0;
        var b_dashed = 0.0;

        //my_h = p_h;
        //my_s = p_s;
        //my_l = p_l;

        p_h = p_h % 360;

        if (p_h < 0.0) p_h += 360;

        x = p_h / 60.0;

        while (x < 0.0)
        {
            x += 2.0;
        }

        while (x >= 2.0)
        {
            x -= 2.0;
        }

        x -= 1.0;
        x = Math.abs(x);
        x = 1.0 - x;
        x *= c;

        switch (Math.floor(p_h / 60.0))
        {
            case 0:
                r_dashed = c;
                g_dashed = x;
                break;

            case 1:
                r_dashed = x;
                g_dashed = c;
                break;

            case 2:
                g_dashed = c;
                b_dashed = x;
                break;

            case 3:
                g_dashed = x;
                b_dashed = c;
                break;

            case 4:
                r_dashed = x;
                b_dashed = c;
                break;

            case 5:
                r_dashed = c;
                b_dashed = x;
                break;
        }

        this.red = (r_dashed + m) * 255.0;
        this.green = (g_dashed + m) * 255.0;
        this.blue = (b_dashed + m) * 255.0;

        if (this.red <= 0.0) this.red = 0;
        if (this.green <= 0.0) this.green = 0;
        if (this.blue <= 0.0) this.blue = 0;

        return this;
    }

    AsVec3()
    {
        let myVec3 = new Vec3Class(this.red / 255.0, this.green / 255.0, this.blue / 255.0);

        return myVec3;
    }

    AsFloat32Array()
    {
        let myArray = new Float32Array(3);

        myArray[0] = this.red / 255.0;
        myArray[1] = this.green / 255.0;
        myArray[2] = this.blue / 255.0;

        return myArray;
    }

    BitReverse(p, p_max)
    {
        let numberOfBits = 3;
        let i, result = 0;

        for (i = 0; i < 32; i++)
        {
            if (p_max & (1 << i))
            {
                numberOfBits = i;
                break;
            }
        }

        for (i = 0; i < numberOfBits; i++)
        {
            if (p & (1 << ((numberOfBits - 1) - i))) result += (1 << i);
        }

        return result;
    }

    SetFromHSLString(p)
    {
        if (p.substring(0, 4) == "hsl(") p = p.substring(4);
        if (p.substring(p.length - 1) == ")") p = p.substring(0, p.length - 1);
        
        var myFields = p.split(",");

        if (myFields.length == 3)
        {
            var h = parseInt(myFields[0].trim());
            var s = myFields[1].trim();

            if (s[s.length - 1] == "%") s = parseFloat(s.substring(0, s.length - 1)) / 100;

            var l = myFields[2].trim();

            if (l[l.length - 1] == "%") l = parseFloat(l.substring(0, l.length - 1)) / 100;

            this.SetFromHSL(h, s, l);
        }
    }

    SetFromRGBHex(p)
    {
        if (p.startsWith("#")) p = p.substring(1);

        var a = parseInt(p, 16);

        this.red = (a >> 16) & 255;
        this.green = (a >> 8) & 255;
        this.blue = a & 255;
    }

    CopyFrom(p)
    {
        this.red = p.red;
        this.green = p.green;
        this.blue = p.blue;
    }
}

class MatrixClass
{
    constructor(p)
    {
        this.numberOfRows = 4;
        this.numberOfColumns = 4;
        this.m = new Float32Array(this.numberOfRows * this.numberOfColumns);
        this.default = null;

        if (p == true) this.SetIdentity();
        else this.Clear();
    }
    
    Clear()
    {
        for (var myRow = 0; myRow < this.numberOfRows; myRow++)
        {
            for (var myColumn = 0; myColumn < this.numberOfColumns; myColumn++) this.Set(myRow, myColumn , 0.0);
        }
    }
    
    SetIdentity()
    {
        this.Clear();
        
        if (this.numberOfRows == this.numberOfColumns)
        {
            for (var i = 0; i < this.numberOfRows; i++) this.Set(i, i, 1.0);
        }
        else
        {
            if (this.numberOfRows == 1) this.Set(0, this.numberOfColumns - 1, 1.0);
        }
    }
    
    SaveDefault()
    {
        if (this.default == null) this.default = new MatrixClass();

        this.default.CopyFrom(this);
    }

    LoadDefault()
    {
        this.CopyFrom(this.default);
    }

    Set(p_row, p_column, p_value)
    {
        this.m[(p_column * this.numberOfRows) + p_row] = p_value;

        return this;
    }
    
    Get(p_row, p_column)
    {
        return this.m[(p_column * this.numberOfRows) + p_row];
    }
    
    AddTranslate(p_x, p_y, p_z)
    {
        var t = new MatrixClass(true);
        
        t.Set(0, 3, p_x);
        t.Set(1, 3, p_y);
        t.Set(2, 3, p_z);
        
        this.MultiplyBy(t);
        t = null;
        
        return this;
    }
    
    SetTranslate(p_x, p_y, p_z)
    {
        this.SetIdentity();
        this.Set(0, 3, p_x);
        this.Set(1, 3, p_y);
        this.Set(2, 3, p_z);

        return this;
    }
    
    UpdateTranslateX(p_x)
    {
        this.Set(0, 3, p_x);

        return this;
    }

    UpdateTranslateY(p_y)
    {
        this.Set(1, 3, p_y);

        return this;
    }

    UpdateTranslateZ(p_z)
    {
        this.Set(2, 3, p_z);

        return this;
    }

    AddScale(p_xScale, p_yScale, p_zScale)
    {
        var t = new MatrixClass(true);
        
        t.Set(0, 0, p_xScale);
        t.Set(1, 1, p_yScale);
        t.Set(2, 2, p_zScale);
        
        this.MultiplyBy(t);
        t = null;
        
        return this;
    }
    
    SetScale(p_xScale, p_yScale, p_zScale)
    {
        this.SetIdentity();
        this.Set(0, 0, p_xScale);
        this.Set(1, 1, p_yScale);
        this.Set(2, 2, p_zScale);

        return this;
    }

    SetRotateX(p_degrees)
    {
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        this.SetIdentity();
        this.Set(1, 1, myCos);
        this.Set(2, 2, myCos);
        this.Set(1, 2, -mySin);
        this.Set(2, 1, mySin);

        return this;
    }

    SetRotateY(p_degrees)
    {
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        this.SetIdentity();
        this.Set(0, 0, myCos);
        this.Set(2, 2, myCos);
        this.Set(2, 0, -mySin);
        this.Set(0, 2, mySin);

        return this;
    }

    SetRotateZ(p_degrees)
    {
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        this.SetIdentity();
        this.Set(0, 0, myCos);
        this.Set(1, 1, myCos);
        this.Set(0, 1, -mySin);
        this.Set(1, 0, mySin);

        return this;
    }

    AddRotateX(p_degrees)
    {
        var t = new MatrixClass(true);
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        t.Set(1, 1, myCos);
        t.Set(2, 2, myCos);
        t.Set(1, 2, -mySin);
        t.Set(2, 1, mySin);
        
        this.MultiplyBy(t);
        t = null;
        
        return this;
    }

    AddRotateY(p_degrees)
    {
        var t = new MatrixClass(true);
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        t.Set(0, 0, myCos);
        t.Set(2, 2, myCos);
        t.Set(2, 0, -mySin);
        t.Set(0, 2, mySin);
        
        this.MultiplyBy(t);
        t = null;
        
        return this;
    }

    AddRotateZ(p_degrees)
    {
        var t = new MatrixClass(true);
        var theta = (p_degrees * Math.PI / 180.0);
        var mySin = Math.sin(theta);
        var myCos = Math.cos(theta);
        
        t.Set(0, 0, myCos);
        t.Set(1, 1, myCos);
        t.Set(0, 1, -mySin);
        t.Set(1, 0, mySin);
        
        this.MultiplyBy(t);
        t = null;
        
        return this;
    }

    MultiplyBy(p)
    {
        var result = new MatrixClass(false);
        
        for (var myRow = 0; myRow < this.numberOfRows; myRow++)
        {
            for (var myColumn = 0; myColumn < this.numberOfColumns; myColumn++)
            {
                var mySum = 0.0;
                
                for (var i = 0; i < this.numberOfColumns; i++) mySum += this.Get(myRow, i) * p.Get(i, myColumn);
                
                result.Set(myRow, myColumn, mySum);
            }
        }
        
        for (var i = 0; i < 16; i++) this.m[i] = result.m[i];
    }
    
    Cotangent(p_angle)
    {
        return 1.0 / Math.tan(p_angle);
    }
    
    CreateProjectionMatrix(p_fovy, p_aspectRatio, p_nearPlane, p_farPlane)
    {
        var yScale = this.Cotangent(((p_fovy / 2.0) * Math.PI) / 180.0);
        var xScale = yScale / p_aspectRatio;
        var frustumLength = p_farPlane - p_nearPlane;
        
        this.Clear();
        this.Set(0, 0, xScale);
        this.Set(1, 1, yScale);
        this.Set(2, 2, -((p_farPlane + p_nearPlane) / frustumLength));
        this.Set(3, 2, -1);
        this.Set(2, 3, -((2.0 * p_nearPlane * p_farPlane) / frustumLength));
    }
    
    CreateOrthoMatrix(p_left, p_right, p_bottom, p_top, p_nearVal, p_farVal)
    {
        this.Clear();
        this.Set(0, 0, 2.0 / (p_right - p_left));
        this.Set(1, 1, 2.0 / (p_top - p_bottom));
        this.Set(2, 2, -2.0 / (p_farVal - p_nearVal));
        this.Set(3, 3, 1.0);
        this.Set(0, 3, -(p_right + p_left) / (p_right - p_left));
        this.Set(1, 3, -(p_top + p_bottom) / (p_top - p_bottom));
        this.Set(2, 3, -(p_farVal + p_nearVal) / (p_farVal - p_nearVal));
    }
    
    CreateOrtho2DMatrix(p_left, p_right, p_bottom, p_top)
    {
        this.CreateOrthoMatrix(p_left, p_right, p_bottom, p_top, -1.0, 1.0);
    }
    
    CopyFrom(p_matrix)
    {
        for (var i = 0; i < 16; i++) this.m[i] = p_matrix.m[i];
        
        return this;
    }
    
    NoZ()
    {
        this.Set(2, 2, 0);
    }
    
    Vec3NormMultiply(p_vec3)
    {
        var result = new Vec3Class();
        var sums = new Array(4);
        
        for (var row = 0; row < 4; row++)
        {
            sums[row] = 0.0;
            
            sums[row] += this.Get(row, 0) * p_vec3.x;
            sums[row] += this.Get(row, 1) * p_vec3.y;
            sums[row] += this.Get(row, 2) * p_vec3.z;
            sums[row] += this.Get(row, 3);
        }
        
        result.x = sums[0] / sums[3];
        result.y = sums[1] / sums[3];
        result.z = sums[2] / sums[3];

        return result;
    }
    
    Vec3Multiply(p_vec3)
    {
        var result = new Vec3Class();
        var sums = new Array(4);
        
        for (var row = 0; row < 4; row++)
        {
            sums[row] = 0.0;
            
            sums[row] += this.Get(row, 0) * p_vec3.x;
            sums[row] += this.Get(row, 1) * p_vec3.y;
            sums[row] += this.Get(row, 2) * p_vec3.z;
            sums[row] += this.Get(row, 3);
        }
        
        result.x = sums[0];
        result.y = sums[1];
        result.z = sums[2];
        
        return result;
    }

    Vec4Multiply(p)
    {
        var result = new Vec4Class();
        var sums = new Array(4);
        
        for (var row = 0; row < 4; row++)
        {
            sums[row] = 0.0;
            
            sums[row] += this.Get(row, 0) * p.x;
            sums[row] += this.Get(row, 1) * p.y;
            sums[row] += this.Get(row, 2) * p.z;
            sums[row] += this.Get(row, 3);
        }
        
        result.x = sums[0];
        result.y = sums[1];
        result.z = sums[2];
        
        return result;
    }
}


class ModelClass
{
    constructor(p_name, p_openGLRef)
    {
        if (p_openGLRef === undefined) this.myOpenGLRef = null;
        else this.myOpenGLRef = p_openGLRef;

        this.myName = p_name;
        this.children = [];
        this.vboRef = null;
        this.vboObjectIndex = -1;
        this.matrixList = [];
        this.matrixNames = [];
        this.currentDrawMatrix = new MatrixClass(true);
        this.parent = null;
        this.enabled = true;
        this.useLighting = true;
        this.invert = false;
        this.textureBackgroundColour = null;
        this.animationList = [];
        this.bypassMatrixes = false;
        this.tag = "";
    }
    
    AddChild(p_name)
    {
        var myChild = new ModelClass(p_name, this.myOpenGLRef);
        
        this.children.push(myChild);
        myChild.parent = this;
        
        return myChild;    
    }
    
    RemoveChild(p_name)
    {
        var myIndex = -1;

        for (var i = 0; i < this.children.length; i++)
        {
            if (this.children[i].myName == p_name)
            {
                myIndex = i;
                break;
            }
        }

        if (myIndex >= 0) this.children.splice(myIndex, 1);
    }

    RemoveChildren()
    {
        this.children = [];
    }
    
    AddAnimation(p_animationObjectRef)
    {
        this.animationList.push(p_animationObjectRef);

        return p_animationObjectRef;
    }

    SetVBO(p_vboRef)
    {
        this.vboRef = p_vboRef;
        
        return this;
    }
    
    SetVBOObjectIndex(p)
    {
        this.vboObjectIndex = p;
        
        return this;
    }
    
    Draw()
    {
        if (this.enabled)
        {
            var i;
            
            this.currentDrawMatrix.SetIdentity();

            // Inherit the parent's Draw Matrix if available
            if (this.parent != null) this.currentDrawMatrix.CopyFrom(this.parent.currentDrawMatrix); 
            
            for (i = 0; i < this.matrixList.length; i++) this.currentDrawMatrix.MultiplyBy(this.matrixList[i]);
        
            if (!this.useLighting) this.EnableLighting(false);

            if (this.bypassMatrixes) this.BypassMatrixes(true);

            if (this.invert) this.Invert(true);

            if (this.textureBackgroundColour != null)
            {
                if (this.myOpenGLRef == null) gl.uniform3v(myProgram.textureBackgroundColourUniformLocation, this.textureBackgroundColour);
                else this.myOpenGLRef.SetTextureBackgroundColour(this.textureBackgroundColour);
            }

            if (this.vboRef != null)
            {    
                if (this.vboObjectIndex != -1) ModelClass.drawArraysCalls += this.vboRef.Draw(this.currentDrawMatrix, this.vboObjectIndex);
            }

            for (i = 0; i < this.children.length; i++) this.children[i].Draw();

            if (!this.useLighting) this.EnableLighting(true);

            if (this.bypassMatrixes) this.BypassMatrixes(false);

            if (this.invert) this.Invert(false);
        }
    }
    
    Child(p_name)
    {
        var myIndex = -1;
        
        if (typeof(p_name) == "number") myIndex = p_name;
        else
        {
            for (var i = 0; i < this.children.length; i++)
            {
                if (this.children[i].myName == p_name)
                {
                    myIndex = i;
                    break;
                }
            }
        }
        
        if (myIndex >= 0) return this.children[myIndex];
        else return null;
    }
    
    AddMatrix(p_name)
    {
        var myMatrix = new MatrixClass(true);
        
        this.matrixList.push(myMatrix);
        this.matrixNames.push(p_name);
        
        return myMatrix;
    }
    
    Matrix(p_name)
    {
        var myIndex = -1;
        
        for (var i = 0; i < this.matrixList.length; i++)
        {
            if (this.matrixNames[i] == p_name)
            {
                myIndex = i;
                break;
            }
        }
        
        if (myIndex >= 0) return this.matrixList[myIndex];
        else return null;
    }
    
    RemoveMatrix(p_name)
    {
        var myIndex = -1;
        
        for (var i = 0; i < this.matrixList.length; i++)
        {
            if (this.matrixNames[i] == p_name)
            {
                myIndex = i;
                break;
            }
        }
        
        if (myIndex >= 0)
        {
            this.matrixList.splice(myIndex, 1);
            this.matrixNames.splice(myIndex, 1);
        }
    }

    Animation(p_name)
    {
        var myIndex = -1;
        
        if (typeof(p_name) == "number") myIndex = p_name;
        else
        {
            for (var i = 0; i < this.animationList.length; i++)
            {
                if (this.animationList[i].myName == p_name)
                {
                    myIndex = i;
                    break;
                }
            }
        }
        
        if (myIndex >= 0) return this.animationList[myIndex];
        else return null;
    }
    
    GetNumberOfChildren()
    {
        return this.children.length;
    }
    
    Enable(p)
    {
        this.enabled = p;
        
        return this;
    }

    SetUseLighting(p)
    {
        this.useLighting = p;

        return this;
    }

    SetBypassMatrixes(p)
    {
        this.bypassMatrixes = p;

        return this;
    }

    SetInvert(p)
    {
        this.invert = p;

        return this;
    }

    SetTextureBackgroundColour(p)
    {
        if (this.textureBackgroundColour == null) this.textureBackgroundColour = new Float32Array(3);

        var myArray = p.AsFloat32Array();

        for (var i = 0; i < 3; i++) this.textureBackgroundColour[i] = myArray[i];
    }
    
    EnableLighting(p)
    {
        if (this.myOpenGLRef == null) gl.uniform1i(myProgram.useLightingUniformLocation, p);
        else this.myOpenGLRef.EnableLighting(p);
    }

    BypassMatrixes(p)
    {
        if (this.myOpenGLRef == null) gl.uniform1i(myProgram.bypassMatrixesUniformLocation, p);
        else this.myOpenGLRef.BypassMatrixes(p);
    }

    Invert(p)
    {
        if (this.myOpenGLRef == null) gl.uniform1i(this.myProgram.invertTextureUniformLocation, p);
        else this.myOpenGLRef.Invert(p);        
    }

    DisplayDig(p_nodeCount, p_index, p_tabSpaces, p_enabled)
    {
        var myColour = "#000000";

        if (this.enabled && p_enabled)
        {
            if ((this.vboRef != null) && (this.vboObjectIndex != -1)) myColour = "#f00000";
        }
        else
        {
            myColour = "#888800";
            p_enabled = false;
        }

        console.log(p_tabSpaces + "%cNode: " + p_nodeCount.a + "  Child[" + p_index + "]: " + this.myName, "color: " + myColour + ";");
        p_nodeCount.a++;

        p_tabSpaces += "    ";

        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].DisplayDig(p_nodeCount, i, p_tabSpaces, p_enabled);
        }

        p_tabSpaces = p_tabSpaces.substring(0, p_tabSpaces.length - 4);
    }

    Display()
    {
        var nodeCount = {a: 0};
        this.DisplayDig(nodeCount, 0, "", true);        
    }

    SetTextureTextValues(p_backgroundColour)
    {
        this.SetUseLighting(false);
        this.SetInvert(true);
        this.SetTextureBackgroundColour(p_backgroundColour);        
    }

    SetTag(p)
    {
        this.tag = p;

        return this;
    }

    GetTag()
    {
        return this.tag;
    }
}

ModelClass.drawArraysCalls = 0;


class TextureClass
{
	constructor(p_id, p_textureRef, p_filename)
	{
		this.id = p_id;
		this.textureRef = p_textureRef;
		this.filename = p_filename;
		this.textureLoaded = false;
	}
}

class TextureManagerClass
{
	constructor(p_openGLRef)
	{
		this.myOpenGLRef = p_openGLRef;
		this.myTextures = [];

		this.myOpenGLRef.gl.pixelStorei(this.myOpenGLRef.gl.UNPACK_FLIP_Y_WEBGL, true);
	}

	LoadTexture(p_url)
	{
		var myIndex = -1;

		// Check if this texture is already loaded
		for (var i = 0; i < this.myTextures.length; i++)
		{
			if (this.myTextures[i].filename == p_url)
			{
				myIndex = i;
				break;
			}
		}

		if (myIndex == -1)
		{
			var myTextureObject = new TextureClass(this.myTextures.length + 1, null, p_url);
			const myImage = new Image();

			this.myTextures.push(myTextureObject);
			myIndex = this.myTextures.length - 1;
			this.myTextures[myIndex].textureRef = this.myOpenGLRef.gl.createTexture();
			this.myOpenGLRef.gl.bindTexture(this.myOpenGLRef.gl.TEXTURE_2D, this.myTextures[myIndex].textureRef);
			this.myOpenGLRef.gl.texImage2D(this.myOpenGLRef.gl.TEXTURE_2D, 0, this.myOpenGLRef.gl.RGBA, 1, 1, 0, this.myOpenGLRef.gl.RGBA, this.myOpenGLRef.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255 ,255]));
			this.myOpenGLRef.gl.bindTexture(this.myOpenGLRef.gl.TEXTURE_2D, null);
			myImage.src = p_url;
			myImage.onload = () =>
			{
				this.myOpenGLRef.gl.bindTexture(this.myOpenGLRef.gl.TEXTURE_2D, this.myTextures[myIndex].textureRef);
				this.myOpenGLRef.gl.texImage2D(this.myOpenGLRef.gl.TEXTURE_2D, 0, this.myOpenGLRef.gl.RGBA, this.myOpenGLRef.gl.RGBA, this.myOpenGLRef.gl.UNSIGNED_BYTE, myImage);
				this.myOpenGLRef.gl.generateMipmap(this.myOpenGLRef.gl.TEXTURE_2D);
				this.myOpenGLRef.gl.texParameteri(this.myOpenGLRef.gl.TEXTURE_2D, this.myOpenGLRef.gl.TEXTURE_MIN_FILTER, this.myOpenGLRef.gl.LINEAR_MIPMAP_LINEAR);
				this.myOpenGLRef.gl.texParameteri(this.myOpenGLRef.gl.TEXTURE_2D, this.myOpenGLRef.gl.TEXTURE_MAG_FILTER, this.myOpenGLRef.gl.LINEAR);
				this.myOpenGLRef.gl.bindTexture(this.myOpenGLRef.gl.TEXTURE_2D, null);
			}
		}

		return this.myTextures[myIndex];
	}

	AddTexture(p_textureRef, p_filename)
	{
		// Use length + 1 for the id so that we start from 1 instead of 0 as 0 indicates "no texture"
		var myTextureObject = new TextureClass(this.myTextures.length + 1, p_textureRef, p_filename);

		this.myTextures.push(myTextureObject);
	}

	GetTextureRef(p_textureId)
	{
		var result = null;
		
		for (var i = 0; i < this.myTextures.length; i++)
		{
			if (this.myTextures[i].id == p_textureId)
			{
				result = this.myTextures[i].textureRef;
				break;
			}
		}

		return result;
	}
}

class ObjectGroupClass
{
    constructor(p_glRef, p_name)
    {
        this.glRef = p_glRef;
        this.name = "";
        this.myObjects = [];
        this.SetName(p_name);
    }
    
    SetName(p_name)
    {
        this.name = p_name;
    }
    
    GetName()
    {
        return this.name;
    }
    
    GenerateNewEntry(p_objectType)
    {
        this.myObjects.push(new OpenGLObjectClass(this.glRef, p_objectType));
        
        return this.myObjects.length - 1;
    }
    
    ApplyMatrix(p_matrix)
    {
        for (var i = 0; i < this.myObjects.length; i++) this.myObjects[i].ApplyMatrix(p_matrix);
        
        return this;
    }
}

class ObjectGroupsClass
{
    constructor(p_glRef)
    {
        this.glRef = p_glRef;
        this.myObjectGroups = [];
        this.workingDirectoryName = "";
        this.myTextureManagerRef = null;
    }
    
    // **********************************************************************************
    CreateObject(p_objectName)
    {
        var i, myObject = null, myGroupIndex = -1, myIndex = p_objectName.indexOf("/"), myGroupName = this.workingDirectoryName, myObjectName = p_objectName;
        
        if (myIndex >= 0)
        {
            myGroupName = p_objectName.substring(0, myIndex);
            myObjectName = p_objectName.substring(myIndex + 1);
        }

        myGroupIndex = this.FindOrCreateDestGroup(myGroupName);
        
        if (myGroupIndex >= 0)
        {
            var myIndex = this.myObjectGroups[myGroupIndex].GenerateNewEntry(this.glRef.TRIANGLES);
            
            myObject = this.myObjectGroups[myGroupIndex].myObjects[myIndex];
            myObject.SetName(myObjectName);
        }
        
        return myObject;
    }
    
    CreateObjectGroup(p_objectGroupName)
    {
        this.myObjectGroups.push(new ObjectGroupClass(this.glRef, p_objectGroupName));
        
        return this.myObjectGroups.length - 1;
    }
    
    // **********************************************************************************
    FindObject(p_objectName)
    {
        var i, j, myIndex = p_objectName.indexOf("/");
        var myObject = null, myObjectName = p_objectName, myGroupName = "", groupIndex = -1;
        
        if (myIndex >= 0)
        {
            myGroupName = p_objectName.substring(0, myIndex);
            myObjectName = p_objectName.substring(myIndex + 1);
        }
        else myGroupName = this.workingDirectoryName;

        // Get the index of the source group
        for(i = 0; this.myObjectGroups.length; i++)
        {
            if (this.myObjectGroups[i].GetName() == myGroupName)
            {
                groupIndex = i;
                break;
            }
        }

        if (groupIndex >= 0)
        {
            for (i = 0; i < this.myObjectGroups[groupIndex].myObjects.length; i++)
            {
                if (this.myObjectGroups[groupIndex].myObjects[i].GetName() == myObjectName)
                {
                    myObject = this.myObjectGroups[groupIndex].myObjects[i];
                    break;
                }
            }
        }

        return myObject;
    }
    
    // **********************************************************************************
    FindObjectGroup(p_objectGroupName)
    {
        var i, myObjectGroup = null;

        for (i = 0; i < this.myObjectGroups.length; i++)
        {
            if (this.myObjectGroups[i].GetName() == p_objectGroupName)
            {
                myObjectGroup = this.myObjectGroups[i];
                break;
            }
        }

        return myObjectGroup;
    }

    // **********************************************************************************
    MergeObject(p_sourceObjectName, p_destObjectName, p_delete)
    {
        // Look for the destination object - has te destination group been specidied ?
        var i, j, myIndex = p_destObjectName.indexOf("/"), destGroupIndex = -1, myDestObject = null, mySourceObject = null;
        var myDestGroupName = "", destObjectName = "", destObjectGroupName = this.workingDirectoryName;
        
        if (myIndex >= 0)
        {
            myDestGroupName = p_destObjectName.substring(0, myIndex);
            destObjectGroupName = myDestGroupName;
            destObjectName = p_destObjectName.substring(myIndex + 1);
        }
        
        // Does the specified destination group already exist ?
        destGroupIndex = this.FindOrCreateDestGroup(destObjectGroupName);
        
        // Does the destination object exist ?
        for (i = 0; i < this.myObjectGroups.length; i++)
        {
            for (j = 0; j < this.myObjectGroups[i].myObjects.length; j++)
            {
                if (this.myObjectGroups[i].myObjects[j].GetName() == destObjectName)
                {
                    myDestObject = this.myObjectGroups[i].myObjects[j];
                    break;
                }
            }
            
            if (myDestObject != null) break;
        }
        
        if (myDestObject == null) myDestObject = this.CreateObject(destObjectGroupName + "/" + destObjectName);
        //alert(destObjectGroupName + ", " + destO)
        // Filter the source objects to copy
        for (i = 0; i < this.myObjectGroups.length; i++)
        {
            for (j = 0; j < this.myObjectGroups[i].myObjects.length; j++)
            {
                mySourceObject = this.myObjectGroups[i].myObjects[j];
                
                if (mySourceObject != myDestObject)
                {
                    //alert("Copying " + this.myObjectGroups[i].myObjects[j].GetName() + " for i = " + i + " and j = " + j);
                    myDestObject.AddTo(mySourceObject);
                }
            }
        }
        
        return myDestObject;
    }
    
    // **********************************************************************************
    FindOrCreateDestGroup(p_name)
    {
        var destGroupIndex = -1;
        
        for (var i = 0; i < this.myObjectGroups.length; i++)
        {
            if (this.myObjectGroups[i].GetName() == p_name)
            {
                destGroupIndex = i;
                break;
            }
        }
        
        if (destGroupIndex == -1) destGroupIndex = this.CreateObjectGroup(p_name);
        
        return destGroupIndex;
    }
    
    // **********************************************************************************
    CopyObject(p_sourceObjectName, p_destObjectName)
    {
        var i, j;
        var srcObjectIndex = -1, srcGroupIndex = -1, destGroupIndex = -1, myIndex = p_sourceObjectName.indexOf("/");
        var sourceObjectName = p_sourceObjectName, destObjectName = p_destObjectName, myObject = null;
        
        // Look for source object by name - check if the group is specified
        if (myIndex >= 0)
        {
            var mySourceGroupName = p_sourceObjectName.substring(0, myIndex);
            
            // Remove the group name from the front of the object name
            sourceObjectName = p_sourceObjectName.substring(myIndex + 1);
        } else mySourceGroupName = this.workingDirectoryName;

        // Get the index of the source group
        for(i = 0; this.myObjectGroups.length; i++)
        {
            if (this.myObjectGroups[i].GetName() == mySourceGroupName)
            {
                srcGroupIndex = i;
                break;
            }
        }
        
        if (srcGroupIndex >= 0)
        {
            // Check that the source object exists if specifed
            if (sourceObjectName != "*")
            {
                for (i = 0; i < this.myObjectGroups[srcGroupIndex].myObjects.length; i++)
                {
                    if (this.myObjectGroups[srcGroupIndex].myObjects[i].GetName() == sourceObjectName)
                    {
                        srcObjectIndex = i;
                        break;
                    }
                }
            }
            
            if ((srcObjectIndex >= 0) || (sourceObjectName == "*"))
            {
                // Has the destination group been specified ?
                myIndex = p_destObjectName.indexOf("/");

                if ((sourceObjectName == "*") && (myIndex == -1))
                {
                    p_destObjectName += "/";
                    myIndex = p_destObjectName.indexOf("/");
                }
                            
                if (myIndex >= 0)
                {
                    destObjectName = p_destObjectName.substring(myIndex + 1);
                    p_destObjectName = p_destObjectName.substring(0, myIndex);
                    
                    // Does the specified destination group already exist ?
                    destGroupIndex = this.FindOrCreateDestGroup(p_destObjectName);
                }
                else destGroupIndex = srcGroupIndex;
                
                // Copy the object(s)
                for (i = 0; i < this.myObjectGroups[srcGroupIndex].myObjects.length; i++)
                {
                    if ((i == srcObjectIndex) || (srcObjectIndex == -1))
                    {
                        myIndex = this.myObjectGroups[destGroupIndex].GenerateNewEntry(this.myObjectGroups[srcGroupIndex].myObjects[i].GetOpenGLObjectType());
                        
                        myObject = this.myObjectGroups[destGroupIndex].myObjects[myIndex];
                        
                        // Copy the data from the source object to the new object
                        myObject.CopyFrom(this.myObjectGroups[srcGroupIndex].myObjects[i]);
                        
                        // Set the name of the new object
                        var destObjectNameToUse = destObjectName;

                        if (destObjectNameToUse == "") destObjectNameToUse = this.myObjectGroups[srcGroupIndex].myObjects[i].GetName();

                        myObject.SetName(destObjectNameToUse);
                    }
                }
            }
        }
        return myObject;
    }

    ShowInfo()
    {
        var z = "";

        for (var i = 0; i < this.myObjectGroups.length; i++)
        {
            if (z != "") z += "\n\n";

            z += "myGroups[" + i + "] = " + this.myObjectGroups[i].GetName();

            for (var j = 0; j < this.myObjectGroups[i].myObjects.length; j++)
            {
                z += "\n myObjects[" + j + "] = " + this.myObjectGroups[i].myObjects[j].GetName() + " Nodes = " + this.myObjectGroups[i].myObjects[j].GetVertexCount();
            }
        }

        alert(z);
    }

    ApplyMatrix(p_objectName, p_matrix)
    {
        // Look for the object - start off at the file level
        var i, j, foundIt = false;

        for (i = 0; i < this.myObjectGroups.length; i++)
        {
            if (this.myObjectGroups[i].GetName() == p_objectName)
            {
                // Found it .. run the mastrix on all objects in this group
                for (j = 0; j < this.myObjectGroups[i].myObjects.length; j++) this.myObjectGroups[i].myObjects[j].ApplyMatrix(p_matrix);

                foundIt = true;
                break;
            }
        }

        if (!foundIt)
        {
            // Try each object
            var myObject = this.FindObject(p_objectName);

            if (myObject != null) myObject.ApplyMatrix(p_matrix);
        }
    }

    SetWorkingGroup(p)
    {
        this.workingDirectoryName = p;
    }

    BindTextureManager(p)
    {
        this.myTextureManagerRef = p;
    }
}

class OpenGLClass
{
	constructor(p_canvasHeight, p_useVAO, p_useTextures)
	{
		this.myCanvas = this.GetCanvas("webgl-canvas");

      	// Set the canvas to the size of the screen
      	this.myCanvas.width = window.innerWidth;
      	
      	if (p_canvasHeight === undefined) this.myCanvas.height = window.innerHeight;
      	else this.myCanvas.height = p_canvasHeight;

        //this.myCanvas.height = 900;

      	// Retrieve a WebGL context
      	this.gl = this.GetGLContext(this.myCanvas);

	    // Set WebGL settings
	    this.backgroundColour = new Vec3Class(0.93, 0.93, 0.93);
	    this.gl.clearColor(this.backgroundColour.x, this.backgroundColour.y, this.backgroundColour.z, 1);
	    this.gl.enable(this.gl.CULL_FACE);
	    this.gl.frontFace(this.gl.CCW);
	    this.gl.cullFace(this.gl.BACK);
	    this.gl.enable(this.gl.DEPTH_TEST);

        //if (p_useTextures) this.gl.enable(this.gl.TEXTURE_2D);

	    this.program = null;
	    this.programNoLighting = null;
	    this.myActiveProgram = null;
        this.modelVBO = new VBOClass(this);
        this.modelMatrix = new MatrixClass(true);
        this.viewMatrix = new MatrixClass(true);
        this.projectionMatrix = new MatrixClass(true);
        this.cameraTranslateMatrix = new MatrixClass(true);
        this.cameraRotateMatrix = new MatrixClass(true);
        this.postProjectionMatrix = new MatrixClass(true);
        this.bypassMatrix = new MatrixClass(true);
        this.bypassMatrix.Set(1, 1, this.myCanvas.width / this.myCanvas.height);
        this.myAmbientLightLevel = 0.25;
        this.myDiffuseLightPosition = new Float32Array(3);
        this.myCameraPosition = new Float32Array(3);
        this.myYaw = 0.0;
        this.useTextures = p_useTextures;
        this.myTextureManager = new TextureManagerClass(this);
        this.T = 0;
        this.objectsToDelete = [];

        if (p_useVAO !== undefined)
        {
            if (p_useVAO) this.modelVBO.RunAsVAO();
        }

        this.modelVBO.EnableTextures(this.useTextures);

	    this.InitProgram();
	    this.InitBuffers();
	}

    GetCanvasTop()
    {
        return this.myCanvas.getBoundingClientRect().top;   
    }

	GetCanvas(p_id)
	{
    	var myCanvas = document.getElementById(p_id);

    	if (myCanvas == null)
    	{
			myCanvas = document.createElement("canvas");
			myCanvas.id = p_id;
			document.body.appendChild(myCanvas);
    	}

    	if (!myCanvas)
    	{
      		console.error("There is no canvas with id ${id} on this page");
      		return null;
    	}

    	return myCanvas;
    }

	// Given a canvas element, return the WebGL2 context
	GetGLContext(p_canvas)
	{
	    return p_canvas.getContext("webgl2") || console.error('WebGL2 is not available in your browser.');
	}

	InitProgram()
    {
        //const vertexShader = this.GetShader("vertexShader");
        const vertexShader = this.GetShader("vertexShaderTextures");
        //const fragmentShader = this.GetShader("fragmentShader");
        const fragmentShader = this.GetShader("fragmentShaderTextures");
        const vertexShaderNoLighting = this.GetShader("vertexShaderNoLighting");
        const fragmentShaderNoLighting = this.GetShader("fragmentShaderNoLighting");

        // Create a program
        this.myProgram = this.gl.createProgram();
        this.myProgramNoLighting = this.gl.createProgram();

        // Attach the shaders to this program
        this.gl.attachShader(this.myProgram, vertexShader);
        this.gl.attachShader(this.myProgram, fragmentShader);
        this.gl.linkProgram(this.myProgram);

        if (!this.gl.getProgramParameter(this.myProgram, this.gl.LINK_STATUS)) {
          console.error('Could not initialize shaders');
        }

        this.gl.attachShader(this.myProgramNoLighting, vertexShaderNoLighting);
        this.gl.attachShader(this.myProgramNoLighting, fragmentShaderNoLighting);
        this.gl.linkProgram(this.myProgramNoLighting);

        if (!this.gl.getProgramParameter(this.myProgramNoLighting, this.gl.LINK_STATUS)) {
          console.error('Could not initialize shaders');
        }

        this.myProgram.OnDraw = myProgram_OnDraw;
        this.myProgramNoLighting.OnDraw = myProgramNoLighting_OnDraw;

        this.myActiveProgram = this.myProgram;

        // Use this program instance
        this.gl.useProgram(this.myActiveProgram);

        this.myProgram.aVertexPosition = this.gl.getAttribLocation(this.myProgram, "aVertexPosition");
        this.myProgram.uModelColour = this.gl.getAttribLocation(this.myProgram, "uModelColour");
        this.myProgram.modelMatrix = this.gl.getUniformLocation(this.myProgram, "modelMatrix");
        this.myProgram.viewMatrix = this.gl.getUniformLocation(this.myProgram, "viewMatrix");
        this.myProgram.projectionMatrix = this.gl.getUniformLocation(this.myProgram, "projectionMatrix");
        this.myProgram.bypassMatrix = this.gl.getUniformLocation(this.myProgram, "bypassMatrix");
        this.myProgram.aNormal = this.gl.getAttribLocation(this.myProgram, "aNormal");
        this.myProgram.ambientLightLevelUniformLocation = this.gl.getUniformLocation(this.myProgram, "ambientLightLevel")
        this.myProgram.diffuseLightPositionUniformLocation = this.gl.getUniformLocation(this.myProgram, "diffuseLightPosition");
        this.myProgram.cameraPositionUniformLocation = this.gl.getUniformLocation(this.myProgram, "cameraPosition");
        this.myProgram.useLightingUniformLocation = this.gl.getUniformLocation(this.myProgram, "useLighting");
        this.myProgram.bypassMatrixesUniformLocation = this.gl.getUniformLocation(this.myProgram, "bypassMatrixes");

            
        if (this.useTextures)
        {
            this.myProgram.useTextureUniformLocation = this.gl.getUniformLocation(this.myProgram, "useTextures");
            this.myProgram.textureSamplerUniformLocation = this.gl.getUniformLocation(this.myProgram, "uSampler");
            this.myProgram.aTexCoord = this.gl.getAttribLocation(this.myProgram, "aTexCoord");
            this.myProgram.invertTextureUniformLocation = this.gl.getUniformLocation(this.myProgram, "invertTexture");
            this.myProgram.textureBackgroundColourUniformLocation = this.gl.getUniformLocation(this.myProgram, "textureBackgroundColour");
            this.gl.uniform1i(this.myProgram.invertTextureUniformLocation, false);

            var tempTextureBackgroundColour = new Float32Array(3);

            for (var i = 0; i < 3; i++) tempTextureBackgroundColour[i] = 0;

            this.gl.uniform3fv(this.myProgram.textureBackgroundColourUniformLocation, tempTextureBackgroundColour);
        }

        this.myProgramNoLighting.aVertexPosition = this.gl.getAttribLocation(this.myProgramNoLighting, "aVertexPosition");
        this.myProgramNoLighting.uModelColour = this.gl.getAttribLocation(this.myProgramNoLighting, "uModelColour");
        this.myProgramNoLighting.modelMatrix = this.gl.getUniformLocation(this.myProgramNoLighting, "modelMatrix");
        this.myProgramNoLighting.viewMatrix = this.gl.getUniformLocation(this.myProgramNoLighting, "viewMatrix");
        this.myProgramNoLighting.projectionMatrix = this.gl.getUniformLocation(this.myProgramNoLighting, "projectionMatrix");
        this.myProgramNoLighting.aNormal = -1;
    }

        // Given an id, extract the content's of a shader script from the DOM and return the compiled shader
    GetShader(p_id)
    {
    	var script = myShaderDictionary[p_id];

        if (script === undefined) script = document.getElementById(p_id);

        const shaderString = script.text.trim();

        // Assign shader depending on the type of shader
        let myShader = null;

        switch (script.type)
        {
            case "x-shader/x-vertex":
                myShader = this.gl.createShader(this.gl.VERTEX_SHADER);
                break;

            case "x-shader/x-fragment":
                myShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                break;
        }

        // Compile the shader using the supplied shader code
        this.gl.shaderSource(myShader, shaderString);
        this.gl.compileShader(myShader);

        // Ensure the shader is valid
        if (!this.gl.getShaderParameter(myShader, this.gl.COMPILE_STATUS)) {
          console.error(this.gl.getShaderInfoLog(myShader));
          return null;
        }

        return myShader;
    }

    InitBuffers()
    {              
        this.SetFor3D(0);
        //this.modelVBO.Enable();
    }

    SetFor3D(p_yOffset = 0)
    {
        var myMatrix = new MatrixClass(true);
        var zeroYPixel = (1 + p_yOffset) * this.myCanvas.height / 2;
        var myFraction = zeroYPixel - Math.floor(zeroYPixel);

        if (myFraction >= 0.5) p_yOffset += ((1 - myFraction) * 2) / this.myCanvas.height;
        else p_yOffset -= (myFraction * 2) / this.myCanvas.height;
        
        this.T = p_yOffset;

        this.projectionMatrix.SetTranslate(0, this.T, 0);
        myMatrix.CreateProjectionMatrix(45.0, this.gl.canvas.width / this.gl.canvas.height, 0.1, 1000.0);
        this.projectionMatrix.MultiplyBy(myMatrix);
        
        this.cameraTranslateMatrix.SetTranslate(0, 0, -5).SaveDefault();
    }

    EnableLighting(p)
    {
    	this.gl.uniform1i(this.myProgram.useLightingUniformLocation, p);
    }

    BypassMatrixes(p)
    {
        this.gl.uniform1i(this.myProgram.bypassMatrixesUniformLocation, p);
    }

    Invert(p)
    {
        this.gl.uniform1i(this.myProgram.invertTextureUniformLocation, p);
    }

    SetTextureBackgroundColour(p)
    {
        this.gl.uniform3fv(this.myProgram.textureBackgroundColourUniformLocation, p);
    }

    BindTexture(p_textureRef)
    {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, p_textureRef);
        this.gl.uniform1i(this.myProgram.textureSamplerUniformLocation, 0);
        this.gl.uniform1i(this.myProgram.useTextureUniformLocation, true);
    }

    UnbindTexture()
    {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.uniform1i(this.myProgram.useTextureUniformLocation, false);
    }

    GetNativePixelSize(p_z)
    {
        var bypassMatrixes = false;
        var myMatrix = new MatrixClass();

        if (p_z == undefined)
        {
            bypassMatrixes = true;
            p_z = 0;
        }

        myMatrix.SetIdentity();

        if (!bypassMatrixes)
        {
            myMatrix.MultiplyBy(this.projectionMatrix);
            myMatrix.MultiplyBy(this.cameraTranslateMatrix);
            myMatrix.MultiplyBy(this.cameraRotateMatrix);
        }

        var nativePixelWidth = 2 * (myMatrix.Get(3, 3) - p_z) / (this.myCanvas.width * myMatrix.Get(0, 0));

        return nativePixelWidth;
    }

    GetPixelPosition(p_vec3)
    {
        var myMatrix = null;

        if (p_vec3.z == null)
        {
            myMatrix = this.bypassMatrix;
            p_vec3.z = 0;
        }
        else
        {
            myMatrix = new MatrixClass();

            myMatrix.SetIdentity();
            myMatrix.MultiplyBy(this.projectionMatrix);
            myMatrix.MultiplyBy(this.cameraTranslateMatrix);
            myMatrix.MultiplyBy(this.cameraRotateMatrix);
        }

        var result = myMatrix.Vec3NormMultiply(p_vec3);

        result.x = (this.myCanvas.width / 2) * (1 + result.x);
        result.y = (this.myCanvas.height / 2) * (1 + result.y);

        return result;
    }

    // ******************************************************
    // MapOpenGLPoint()
    // Maps a 3D OpenGL point to a normalised 2D screen point
    // with x and y values between -1 and +1
    // ******************************************************
    MapOpenGLPoint(p_vec3)
    {
        var myMatrix = null;

        if (p_vec3.z == null)
        {
            myMatrix = this.bypassMatrix;
            p_vec3.z = 0;
        }
        else
        {
            myMatrix = new MatrixClass();
            myMatrix.SetIdentity();
            myMatrix.MultiplyBy(this.projectionMatrix);
            myMatrix.MultiplyBy(this.cameraTranslateMatrix);
            myMatrix.MultiplyBy(this.cameraRotateMatrix);
        }

        var p = myMatrix.Vec3NormMultiply(p_vec3);

        return p;
    }

    // ************************************************************************
    // MapScreenPoint()
    // Maps a 2D screen point where -1 <= p_vec3.x <= 1 and -1 <= p_vec3.y <= 1
    // to a 3D OpenGL vertex for a given z of p_vec3.z
    // ************************************************************************
    MapScreenPoint(p_vec3)
    {
        var p = new Vec3Class(0, 0, p_vec3.z);
        var myMatrix = null;

        if (p_vec3.z == null)
        {
            myMatrix = this.bypassMatrix;
            p_vec3.z = 0;
        }
        else
        {
            myMatrix = new MatrixClass();
            myMatrix.SetIdentity();
            myMatrix.MultiplyBy(this.projectionMatrix);
            myMatrix.MultiplyBy(this.cameraTranslateMatrix);
            myMatrix.MultiplyBy(this.cameraRotateMatrix);
        }
        
        p.x = p_vec3.x * (myMatrix.Get(3, 3) - p_vec3.z) / myMatrix.Get(0, 0);
        p.y = ((p_vec3.y * (myMatrix.Get(3, 3) - p_vec3.z)) - (p_vec3.z * myMatrix.Get(1, 2)) - myMatrix.Get(1, 3)) / myMatrix.Get(1, 1);

        return p;
    }

    GetRoundedX(p_x, p_z = null, p_count = 0)
    {
        if (p_count % 2 == 1) return this.GetRoundedXOdd(p_x, p_z);

        var myPixelPosition = this.GetPixelPosition(new Vec3Class(p_x, 0, p_z));
        var myPixelFraction = myPixelPosition.x - Math.floor(myPixelPosition.x);
        var nativePixelSize = this.GetNativePixelSize(p_z);

        if (myPixelFraction >= 0.5) p_x += (1 - myPixelFraction) * nativePixelSize;
        else p_x -= myPixelFraction * nativePixelSize;

        return p_x;
    } 

    GetRoundedXOdd(p_x, p_z = null)
    {
        var myPixelPosition = this.GetPixelPosition(new Vec3Class(p_x, 0, p_z));
        var myPixelFraction = myPixelPosition.x - Math.floor(myPixelPosition.x);
        var nativePixelSize = this.GetNativePixelSize(p_z);

        p_x += (0.5 - myPixelFraction) * nativePixelSize;

        return p_x;
    } 

    GetRoundedY(p_y, p_z = null, p_count = 0)
    {
        if (p_count % 2 == 1) return this.GetRoundedYOdd(p_y, p_z);

        var myPixelPosition = this.GetPixelPosition(new Vec3Class(0, p_y, p_z));
        var myPixelFraction = myPixelPosition.y - Math.floor(myPixelPosition.y);
        var nativePixelSize = this.GetNativePixelSize(p_z);

        if (myPixelFraction >= 0.5) p_y += (1 - myPixelFraction) * nativePixelSize;
        else p_y -= myPixelFraction * nativePixelSize;

        return p_y;
    } 

    GetRoundedYOdd(p_y, p_z = null)
    {
        var myPixelPosition = this.GetPixelPosition(new Vec3Class(0, p_y, p_z));
        var myPixelFraction = myPixelPosition.y - Math.floor(myPixelPosition.y);
        var nativePixelSize = this.GetNativePixelSize(p_z);

        p_y += (0.5 - myPixelFraction) * nativePixelSize;

        return p_y;
    }

    AddObjectToDelete(p_objectRef)
    {
        this.objectsToDelete.push(p_objectRef);
    }

    DeleteObjects()
    {
        for (var i = 0; i < this.objectsToDelete.length; i++) this.objectsToDelete[i] = null;

        this.objectsToDelete = [];
    } 
}

class DummyOpenGLClass
{
    constructor(p_glRef, p_vboRef)
    {
        this.myYaw = 0.0;
        this.projectionMatrix = projectionMatrix;
        this.viewMatrix = viewMatrix;
        this.cameraTranslateMatrix = cameraTranslateMatrix;
        this.cameraRotateMatrix = cameraRotateMatrix;
        this.modelVBO = p_vboRef;
        this.gl = p_glRef;
    }
}

class FaceDataClass
{
	constructor()
	{
		this.faceId = -1;
		this.textureId = -1;
		this.startingVertexIndex = -1;
	}

	SetFaceId(p)
	{
		this.faceId = p;
	}

	SetStartingVertexIndex(p)
	{
		this.startingVertexIndex = p;
	}

	SetTextureId(p)
	{
		this.textureId = p;
	}

	GetStartingVertexIndex()
	{
		return this.startingVertexIndex;
	}

	GetTextureId()
	{
		return this.textureId;
	}
}

class OpenGLObjectClass
{
    constructor(p_glRef, p_objectType)
    {
        if (p_glRef == null)
        {
            alert("Error: OpenGLObjectClass constructor p_glRef is null");
            return;
        }

        if (p_objectType === undefined) p_objectType = p_glRef.TRIANGLES;

        this.glRef = p_glRef;
        this.vertexList = [];
        this.vboObjectIndex = -1;
        this.vboBufferOffset = -1;
        this.usingVBO = false;
        this.vectorSize = 3;
        this.SIZE_OF_FLOAT = 4;
        this.vboVertexIndex = -1;
        this.openGLObjectType = p_objectType;
        this.name = ""
        this.completeTriangleLines = false;
        this.myFaces = [];
    }
    
    AddVertex(p_position, p_colour, p_normal)
    {
        if (typeof(p_position) == "number")
        {
            var myPosition = new Vec3Class(this.vertexList[p_position].position[0], this.vertexList[p_position].position[1], this.vertexList[p_position].position[2]);
            var myColour = new Vec3Class(this.vertexList[p_position].colour[0], this.vertexList[p_position].colour[1], this.vertexList[p_position].colour[2]);
            var myNormal = new Vec3Class(this.vertexList[p_position].normal[0], this.vertexList[p_position].normal[1], this.vertexList[p_position].normal[2]);

            var myVertex = new VertexClass(myPosition, myColour, myNormal);
            this.vertexList.push(myVertex);
        }
        else
        {
            var myVertex = new VertexClass(p_position, p_colour, p_normal);
            this.vertexList.push(myVertex);

            if (this.completeTriangleLines)
            {
                var myVertexCount = this.GetVertexCount();

                if (myVertexCount > 0)
                {
                    if (myVertexCount % 3 == 0)
                    {
                        this.AddVertex(myVertexCount - 2);
                        this.AddVertex(myVertexCount - 1);
                        this.AddVertex(myVertexCount - 3);
                    }
                }
            }
        }
    }

    GetVertexRef(p_index)
    {
        return this.vertexList[p_index];
    }    

    AddTriangle(p0, p1, p2, p_colour, p_normal)
    {
        this.AddVertex(p0, p_colour, p_normal);
        this.AddVertex(p1, p_colour, p_normal);
        this.AddVertex(p2, p_colour, p_normal);
    }

    AddQuad(p0, p1, p2, p3, p_colour, p_normal)
    {
        this.AddVertex(p0, p_colour, p_normal);
        this.AddVertex(p1, p_colour, p_normal);
        this.AddVertex(p2, p_colour, p_normal);
        this.AddVertex(p0, p_colour, p_normal);
        this.AddVertex(p2, p_colour, p_normal);
        this.AddVertex(p3, p_colour, p_normal);
    }
    
    AddQuadFromArrays(p_positions, p_colour, p_normals)
    {
        this.AddVertex(p_positions[0], p_colour, p_normals[0]);
        this.AddVertex(p_positions[1], p_colour, p_normals[1]);
        this.AddVertex(p_positions[2], p_colour, p_normals[2]);
        this.AddVertex(p_positions[0], p_colour, p_normals[0]);
        this.AddVertex(p_positions[2], p_colour, p_normals[2]);
        this.AddVertex(p_positions[3], p_colour, p_normals[3]);
    }

    AddLine(p0, p1, p_colour, p_normal)
    {
        this.openGLObjectType = this.glRef.LINES;
        this.AddVertex(p0, p_colour, p_normal);
        this.AddVertex(p1, p_colour, p_normal);
    }
    
    AddCurvedQuad(p_width, p_height, p_radius, p_colour)
    {
        var p = new Array(12);
        var myNormal = new Vec3Class(0, 0, 1);
        var segments = 8;

        p_width /= 2.0;
        p_height /= 2.0;

        p[0] = new Vec3Class(p_radius - p_width, p_radius - p_height, 0);
        p[1] = new Vec3Class(-p_width, p_radius - p_height, 0);
        p[2] = new Vec3Class(p_radius - p_width, -p_height, 0);

        p[3] = new Vec3Class(p_width - p_radius, p_radius - p_height, 0);
        p[4] = new Vec3Class(p_width, p_radius - p_height, 0);
        p[5] = new Vec3Class(p_width - p_radius, -p_height, 0);

        p[6] = new Vec3Class(p_width - p_radius, p_height - p_radius, 0);
        p[7] = new Vec3Class(p_width, p_height - p_radius, 0);
        p[8] = new Vec3Class(p_width - p_radius, p_height, 0);

        p[9] = new Vec3Class(p_radius - p_width, p_height - p_radius, 0);
        p[10] = new Vec3Class(-p_width, p_height - p_radius, 0);
        p[11] = new Vec3Class(p_radius - p_width, p_height, 0);

        this.AddQuad(p[2], p[5], p[8], p[11], p_colour, myNormal);
        this.AddQuad(p[1], p[0], p[9], p[10], p_colour, myNormal);
        this.AddQuad(p[3], p[4], p[7], p[6], p_colour, myNormal);

        for (var i = 0; i < segments; i++)
        {
            var theta = (i / segments) * Math.PI / 2.0;
            var thetaDash = ((i + 1) / segments) * Math.PI / 2.0;
            var mySin = p_radius * Math.sin(theta), myCos = p_radius * Math.cos(theta), mySinDash = p_radius * Math.sin(thetaDash), myCosDash = p_radius * Math.cos(thetaDash);

            this.AddTriangle(p[6], new Vec3Class(p[6].x + myCos, p[6].y + mySin, 0), new Vec3Class(p[6].x + myCosDash, p[6].y + mySinDash, 0), p_colour, myNormal);
            this.AddTriangle(p[3], new Vec3Class(p[3].x + myCosDash, p[3].y - mySinDash, 0), new Vec3Class(p[3].x + myCos, p[3].y - mySin, 0), p_colour, myNormal);
            this.AddTriangle(p[9], new Vec3Class(p[9].x - myCosDash, p[9].y + mySinDash, 0), new Vec3Class(p[9].x - myCos, p[9].y + mySin, 0), p_colour, myNormal);
            this.AddTriangle(p[0], new Vec3Class(p[0].x - myCos, p[0].y - mySin, 0), new Vec3Class(p[0].x - myCosDash, p[0].y - mySinDash, 0), p_colour, myNormal);
        }
    }

    AddToVBO(p_vboRef)
    {
        this.vboObjectIndex = p_vboRef.AddObject(this);
        this.usingVBO = true;
        
        return this;
    }
    
    GetVertexByteCount()
    {
        return this.vertexList.length * this.vectorSize * this.SIZE_OF_FLOAT;
    }
    
    GetColourByteCount()
    {
        return this.vertexList.length * this.vectorSize * this.SIZE_OF_FLOAT;
    }

    GetVertexAndColourByteCount()
    {
        return this.GetVertexByteCount() + this.GetColourByteCount();
    }
    
    GetNormalByteCount()
    {
        return this.vertexList.length * this.vectorSize * this.SIZE_OF_FLOAT;
    }
    
    GetTextureByteCount()
    {
        return this.vertexList.length * 2 * this.SIZE_OF_FLOAT;
    }

    GetVBOData()
    {
        var numberOfFloats = this.vertexList.length * 3 * 2;
        var myArray = new Float32Array(numberOfFloats);
        var myIndex = 0;
        
        for (var i = 0; i < this.vertexList.length; i++)
        {
            for (var j = 0; j < 3; j++) myArray[myIndex++] = this.vertexList[i].position[j];
            /*myArray[myIndex++] = this.vertexList[i].position.x;
            myArray[myIndex++] = this.vertexList[i].position.y;
            myArray[myIndex++] = this.vertexList[i].position.z;*/
        }
        
        for (var i = 0; i < this.vertexList.length; i++)
        {
            for (var j = 0; j < 3; j++) myArray[myIndex++] = this.vertexList[i].colour[j];
        }

        return myArray;
    }
    
    GetNormalsVBOData()
    {  
        var numberOfFloats = this.vertexList.length * 3;
        var myArray = new Float32Array(numberOfFloats);
        var myIndex = 0;

        for (var i = 0; i < this.vertexList.length; i++)
        {
            for (var j = 0; j < 3; j++) myArray[myIndex++] = this.vertexList[i].normal[j];
        }
        
        return myArray;
    }
    
    GetTextureVBOData()
    {  
        var numberOfFloats = this.vertexList.length * 2;
        var myArray = new Float32Array(numberOfFloats);
        var myIndex = 0;

        for (var i = 0; i < this.vertexList.length; i++)
        {
            for (var j = 0; j < 2; j++) myArray[myIndex++] = this.vertexList[i].textureCoordinates[j];
        }
        
        return myArray;
    }
    
    GetVertexCount()
    {
        return this.vertexList.length;
    }
    
    GetVBOObjectIndex()
    {
        return this.vboObjectIndex;
    }
    
    SetVBOVertexIndex(p_index)
    {
        this.vboVertexIndex = p_index;
    }
    
    SetName(p_name)
    {
        this.name = p_name
    }
    
    GetName()
    {
        return this.name;
    }
    
    ApplyMatrix(p_matrix)
    {
        for (var i = 0; i < this.vertexList.length; i++) this.vertexList[i].MultiplyBy(p_matrix);
    }
    
    AddTo(p_sourceObject)
    {
        for (var i = 0; i < p_sourceObject.GetVertexCount(); i++) this.vertexList.push(p_sourceObject.GetVertex(i));
    }
    
    GetVertex(p_index)
    {
        var myVertex = new VertexClass(new Vec3Class(0, 0, 0), new Vec3Class(0, 0, 0), new Vec3Class(0, 0, 0));
        
        myVertex.CopyFrom(this.vertexList[p_index]);
        
        return myVertex;
    }
    
    CopyFrom(p_sourceObject)
    {
        this.vertexList = [];
        
        for (var i = 0; i < p_sourceObject.GetVertexCount(); i++) this.vertexList.push(p_sourceObject.GetVertex(i));     
    }
    
    GetOpenGLObjectType()
    {
        return this.openGLObjectType;
    }

    SetOpenGLObjectType(p)
    {
        this.openGLObjectType = p;
    }

    ShowTrianglesAsLines(p)
    {
        if (p)
        {
            this.SetOpenGLObjectType(this.glRef.LINES);
            this.completeTriangleLines = true;
        }
        else
        {
            this.SetOpenGLObjectType(this.glRef.TRIANGLES);
            this.completeTriangleLines = false;            
        }

        return this;
    }

    ShowInfo()
    {
        var z = "";

        for (var i = 0; i < this.vertexList.length; i++)
        {
            if (z != "") z+= "\n";

            z += "Vertex[ " + i + " ] " + this.vertexList[i].ShowInfo();;
        }

        alert(z);
    }

    UsingTextures()
    {
        var result = false;

        if (this.GetNumberOfFaces() > 0) result = true;

        return result;
    }

    AddFace(p_faceId)
    {
        // Create a new face
        var myFaceObject = new FaceDataClass();

        // Configure it
        myFaceObject.SetFaceId(p_faceId);
        myFaceObject.SetStartingVertexIndex(this.GetVertexCount());

        // Add it to the list
        this.myFaces.push(myFaceObject);

        return this.myFaces.length - 1;
    }

    GetNumberOfFaces()
    {
        return this.myFaces.length;
    }

    GetFaceRef(p_index)
    {
        return this.myFaces[p_index];
    }

    AddTexture(p_faceIndex, p_textureId)
    {
        //var myFaceId = this.AddFace(0);

        this.GetFaceRef(p_faceIndex).SetTextureId(p_textureId);
        //this.GetFaceRef(0).SetStartingVertexIndex(0);
        this.GetVertexRef(0).SetUV(0, 0);
        this.GetVertexRef(1).SetUV(1, 0);
        this.GetVertexRef(2).SetUV(1, 1);
        this.GetVertexRef(3).SetUV(0, 0);
        this.GetVertexRef(4).SetUV(1, 1);
        this.GetVertexRef(5).SetUV(0, 1);
    }

    AddQuadTexture(p_faceIndex, p_textureId, p_x0, p_y0, p_x1, p_y1)
    {
        var myIndex = this.vertexList.length - 6;

        this.GetFaceRef(p_faceIndex).SetTextureId(p_textureId);
        this.GetVertexRef(myIndex).SetUV(p_x0, p_y0);
        this.GetVertexRef(myIndex + 1).SetUV(p_x1, p_y0);
        this.GetVertexRef(myIndex + 2).SetUV(p_x1, p_y1);
        this.GetVertexRef(myIndex + 3).SetUV(p_x0, p_y0);
        this.GetVertexRef(myIndex + 4).SetUV(p_x1, p_y1);
        this.GetVertexRef(myIndex + 5).SetUV(p_x0, p_y1);        
    }

    SetVBOBufferOffset(p)
    {
        this.vboBufferOffset = p;
    }

    GetVBOBufferOffset()
    {
        return this.vboBufferOffset;
    }
}

class FontClass
{
	constructor(p_openGLRef, p_name, p_textureURL, p_xOrig, p_yOrig, p_xPitch, p_yPitch, p_charsPerLine, p_bitmapWidth, p_bitmapHeight)
	{
		this.myOpenGLRef = p_openGLRef;
		this.name = p_name;
		this.textureURL = null;
		this.fontData = [];

		if (p_textureURL == undefined)
		{
			// Allow a pixel area of 8 pixels wide by 12 pixels heigh for each character. Most characters start on the second row except things like $
			// The right column is left blank for character spacing except for the ~ character. There is no spacing built in vertically but most characters do not use the top row
			// Just realised that all characters need to be shifted one pixel left so multiply by 2, except Chr(126), and Chr(127) which are correct
			this.xPitch = 8;
			this.yPitch = 12;

			this.fontData = [
			{charCode:32, data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
			{charCode:33, data:[0, 24, 60, 60, 60, 24, 24, 0, 24, 24, 0, 0]},
			{charCode:34, data:[0, 51, 51, 51, 18, 0, 0, 0, 0, 0, 0, 0]},
			{charCode:35, data:[0, 54, 54, 127, 54, 54, 54, 127, 54, 54, 0, 0]},
			{charCode:36, data:[24, 24, 62, 96, 96, 60, 6, 6, 124, 24, 24, 0]},
			{charCode:37, data:[0, 0, 0, 98, 102, 12, 24, 48, 102, 70, 0, 0]},
			{charCode:38, data:[0, 56, 108, 108, 56, 125, 111, 102, 110, 59, 0, 0]},
			{charCode:39, data:[0, 24, 24, 24, 48, 0, 0, 0, 0, 0, 0, 0]},
			{charCode:40, data:[0, 6, 12, 24, 48, 48, 48, 24, 12, 6, 0, 0]},
			{charCode:41, data:[0, 48, 24, 12, 6, 6, 6, 12, 24, 48, 0, 0]},
			{charCode:42, data:[0, 0, 0, 51, 30, 127, 30, 51, 0, 0, 0, 0]},
			{charCode:43, data:[0, 0, 0, 12, 12, 63, 12, 12, 0, 0, 0, 0]},
			{charCode:44, data:[0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 48, 0]},
			{charCode:45, data:[0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0]},
			{charCode:46, data:[0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 0, 0]},
			{charCode:47, data:[0, 0, 1, 3, 6, 12, 24, 48, 96, 64, 0, 0]},

			{charCode:48, data:[0, 62, 99, 103, 111, 107, 123, 115, 99, 62, 0, 0]},
			{charCode:49, data:[0, 8, 24, 120, 24, 24, 24, 24, 24, 126, 0, 0]},
			{charCode:50, data:[0, 60, 102, 102, 6, 12, 24, 48, 102, 126, 0, 0]},
			{charCode:51, data:[0, 60, 102, 6, 6, 28, 6, 6, 102, 60, 0, 0]},
			{charCode:52, data:[0, 6, 14, 30, 54, 102, 127, 6, 6, 15, 0, 0]},
			{charCode:53, data:[0, 126, 96, 96, 96, 124, 6, 6, 102, 60, 0, 0]},
			{charCode:54, data:[0, 28, 48, 96, 96, 124, 102, 102, 102, 60, 0, 0]},
			{charCode:55, data:[0, 126, 99, 99, 3, 6, 12, 24, 24, 24, 0, 0]},
			{charCode:56, data:[0, 60, 102, 102, 102, 60, 102, 102, 102, 60, 0, 0]},
			{charCode:57, data:[0, 60, 102, 102, 102, 62, 12, 12, 24, 56, 0, 0]},
			{charCode:58, data:[0, 0, 0, 28, 28, 0, 0, 28, 28, 0, 0, 0]},

			{charCode:59, data:[0, 0, 0, 28, 28, 0, 0, 28, 28, 12, 24, 0]},
			{charCode:60, data:[0, 6, 12, 24, 48, 96, 48, 24, 12, 6, 0, 0]},
			{charCode:61, data:[0, 0, 0, 0, 63, 0, 63, 0, 0, 0, 0, 0]},
			{charCode:62, data:[0, 48, 24, 12, 6, 3, 6, 12, 24, 48, 0, 0]},
			{charCode:63, data:[0, 60, 102, 6, 12, 24, 24, 0, 24, 24, 0, 0]},
			{charCode:64, data:[0, 62, 0x63, 0x63, 0x6f, 0x6f, 0x6f, 0x60, 0x60, 0x3e, 0, 0]},

			{charCode:65, data:[0, 24, 60, 102, 102, 102, 126, 102, 102, 102, 0, 0]},
			{charCode:66, data:[0, 126, 51, 51, 51, 62, 51, 51, 51, 126, 0, 0]},
			{charCode:67, data:[0, 30, 51, 99, 96, 96, 96, 99, 51, 30, 0, 0]},
			{charCode:68, data:[0, 124, 54, 51, 51, 51, 51, 51, 54, 124, 0, 0]},
			{charCode:69, data:[0, 127, 49, 48, 50, 62, 50, 48, 49, 127, 0, 0]},
			{charCode:70, data:[0, 127, 51, 49, 50, 62, 50, 48, 48, 120, 0, 0]},
			{charCode:71, data:[0, 30, 51, 99, 96, 96, 103, 99, 51, 31, 0, 0]},
			{charCode:72, data:[0, 102, 102, 102, 102, 126, 102, 102, 102, 102, 0, 0]},
			{charCode:73, data:[0, 60, 24, 24, 24, 24, 24, 24, 24, 60, 0, 0]},
			{charCode:74, data:[0, 15, 6, 6, 6, 6, 102, 102, 102, 60, 0, 0]},
			{charCode:75, data:[0, 115, 51, 54, 54, 60, 54, 54, 51, 115, 0, 0]},
			{charCode:76, data:[0, 120, 48, 48, 48, 48, 49, 51, 51, 127, 0, 0]},
			{charCode:77, data:[0, 99, 119, 127, 127, 107, 99, 99, 99, 99, 0, 0]},
			{charCode:78, data:[0, 99, 99, 115, 123, 127, 111, 103, 99, 99, 0, 0]},
			{charCode:79, data:[0, 28, 54, 99, 99, 99, 99, 99, 54, 28, 0, 0]},
			{charCode:80, data:[0, 126, 51, 51, 51, 62, 48, 48, 48, 120, 0, 0]},
			{charCode:81, data:[0, 28, 54, 99, 99, 99, 103, 111, 62, 6, 15, 0]},
			{charCode:82, data:[0, 126, 51, 51, 51, 62, 54, 51, 51, 115, 0, 0]},
			{charCode:83, data:[0, 60, 102, 102, 96, 56, 12, 102, 102, 60, 0, 0]},
			{charCode:84, data:[0, 126, 90, 24, 24, 24, 24, 24, 24, 60, 0, 0]},
			{charCode:85, data:[0, 102, 102, 102, 102, 102, 102, 102, 102, 60, 0, 0]},
			{charCode:86, data:[0, 102, 102, 102, 102, 102, 102, 102, 60, 24, 0, 0]},
			{charCode:87, data:[0, 99, 99, 99, 99, 107, 107, 54, 54, 54, 0, 0]},
			{charCode:88, data:[0, 102, 102, 102, 60, 24, 60, 102, 102, 102, 0, 0]},
			{charCode:89, data:[0, 102, 102, 102, 102, 60, 24, 24, 24, 60, 0, 0]},
			{charCode:90, data:[0, 127, 103, 76, 12, 24, 48, 49, 99, 127, 0, 0]},

			{charCode:91, data:[0, 30, 24, 24, 24, 24, 24, 24, 24, 30, 0, 0]},
			{charCode:92, data:[0, 0, 64, 96, 48, 24, 12, 6, 3, 1, 0, 0]},
			{charCode:93, data:[0, 30, 6, 6, 6, 6, 6, 6, 6, 30, 0, 0]},
			{charCode:94, data:[8, 28, 54, 99, 0, 0, 0, 0, 0, 0, 0, 0]},
			{charCode:95, data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0]},
			{charCode:96, data:[24, 24, 12, 0, 0, 0, 0, 0, 0, 0, 128, 0]},

			{charCode:97, data:[0, 0, 0, 0, 60, 6, 62, 102, 102, 59, 0, 0]},
			{charCode:98, data:[0, 112, 48, 48, 62, 51, 51, 51, 51, 110, 0, 0]},
			{charCode:99, data:[0, 0, 0, 0, 60, 102, 96, 96, 102, 60, 0, 0]},
			{charCode:100, data:[0, 14, 6, 6, 62, 102, 102, 102, 102, 59, 0, 0]},
			{charCode:101, data:[0, 0, 0, 0, 60, 102, 126, 96, 102, 60, 0, 0]},
			{charCode:102, data:[0, 28, 54, 48, 48, 124, 48, 48, 48, 120, 0, 0]},
			{charCode:103, data:[0, 0, 0, 0, 59, 102, 102, 102, 62, 6, 102, 60]},
			{charCode:104, data:[0, 112, 48, 48, 54, 59, 51, 51, 51, 115, 0, 0]},
			{charCode:105, data:[0, 12, 12, 0, 60, 12, 12, 12, 12, 63, 0, 0]},
			{charCode:106, data:[0, 6, 6, 0, 30, 6, 6, 6, 6, 102, 102, 60]},
			{charCode:107, data:[0, 112, 48, 48, 51, 54, 60, 54, 51, 115, 0, 0]},
			{charCode:108, data:[0, 60, 12, 12, 12, 12, 12, 12, 12, 63, 0, 0]},
			{charCode:109, data:[0, 0, 0, 0, 126, 107, 107, 107, 107, 99, 0, 0]},
			{charCode:110, data:[0, 0, 0, 0, 124, 102, 102, 102, 102, 102, 0, 0]},
			{charCode:111, data:[0, 0, 0, 0, 60, 102, 102, 102, 102, 60, 0, 0]},
			{charCode:112, data:[0, 0, 0, 0, 110, 51, 51, 51, 51, 62, 48, 120]},
			{charCode:113, data:[0, 0, 0, 0, 59, 102, 102, 102, 102, 62, 6, 15]},
			{charCode:114, data:[0, 0, 0, 0, 118, 55, 59, 48, 48, 120, 0, 0]},
			{charCode:115, data:[0, 0, 0, 0, 60, 102, 48, 12, 102, 60, 0, 0]},
			{charCode:116, data:[0, 0, 16, 48, 126, 48, 48, 48, 54, 28, 0, 0]},
			{charCode:117, data:[0, 0, 0, 0, 102, 102, 102, 102, 102, 59, 0, 0]},
			{charCode:118, data:[0, 0, 0, 0, 102, 102, 102, 102, 60, 24, 0, 0]},
			{charCode:119, data:[0, 0, 0, 0, 99, 99, 107, 107, 54, 54, 0, 0]},
			{charCode:120, data:[0, 0, 0, 0, 99, 54, 28, 28, 54, 99, 0, 0]},
			{charCode:121, data:[0, 0, 0, 0, 51, 51, 51, 51, 30, 6, 12, 120]},
			{charCode:122, data:[0, 0, 0, 0, 126, 70, 12, 48, 98, 126, 0, 0]},

			{charCode:123, data:[0, 14, 24, 24, 48, 96, 48, 24, 24, 14, 0, 0]},
			{charCode:124, data:[0, 12, 12, 12, 12, 0, 12, 12, 12, 12, 0, 0]},
			{charCode:125, data:[0, 112, 24, 24, 12, 6, 12, 24, 24, 112, 0, 0]},
			{charCode:126, data:[0, 0x73, 0xda, 0xce, 0, 0, 0, 0, 0, 0, 0, 0]},
			{charCode:127, data:[0xaa, 0x01, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]}	// This should be DELETE but added a cross-hatch test instead
			];
		}
		else
		{
			this.textureURL = p_textureURL;
			this.xOrig = p_xOrig;
			this.yOrig = p_yOrig;
			this.xPitch = p_xPitch;
			this.yPitch = p_yPitch;
			this.charsPerLine = p_charsPerLine;
			this.bitmapWidth = p_bitmapWidth;
			this.bitmapHeight = p_bitmapHeight;
		}
	}

	GetFontData(p_char, p_x, p_y)
	{
	    var result = false;
	    var i, myIndex = -1;
	    
	    for (i = 0; i < this.fontData.length; i++)
	    {
	        if (this.fontData[i].charCode == p_char)
	        {
	            myIndex = i;
	            break;
	        }
	    }
	    
	    if (myIndex >= 0)
	    {
	    	var myAsciiCode = this.fontData[myIndex].charCode;
	    	var myFontData = this.fontData[myIndex].data[p_y];

	    	if (myAsciiCode < 126) myFontData = myFontData << 1;

	        //if (this.fontData[myIndex].data[p_y] & (1 << p_x)) result = true;
	        if (myFontData & (1 << p_x)) result = true;
	    }
	    
	    return result;
	}

	ConvertToLines(p_text, p_reversed)
	{
		var reversed = false;
		var myLines = [];
		var i, startIndex = 0, myLength = p_text.length;

		if (p_reversed !== undefined) reversed = p_reversed;

		for (i = 0; i < myLength; i++)
		{
			// Look for \n newline character
			if (p_text.charCodeAt(i) == 10)
			{
				// Add or insert the text up to this \n to myLines
				if (reversed) myLines.unshift(p_text.substring(startIndex, i));
				else myLines.push(p_text.substring(startIndex, i));
				
				startIndex = i + 1;
			}
		}

		// Insert any remaining text at the start of myLines
		if (startIndex < myLength)
		{
			if (reversed) myLines.unshift(p_text.substring(startIndex));
			else myLines.push(p_text.substring(startIndex));
		}
			
		return myLines;
	}

	CreateTextFromDOSFont(p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		const pixelsWide = 8, pixelsHigh = 12;
	    var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
		var myNormal = new Vec3Class();
		var zStart = p_depth * (p_pixelsDeep - 1);
		var i, j;
		var charHeight = pixelsHigh * p_pixelHeight;
		var myColour = p_colour.AsVec3();
		var A = p_pixelWidth * pixelsWide;
		var myLines = this.ConvertToLines(p_text);

		p_depth /= 2.0;

		if (p_pixelsDeep < 1) p_pixelsDeep = 1;

		for (j = 0; j < myLines.length; j++)
		{
			var N = myLines[j].length;
			var xStart = -(N * A) / 2.0;
			var yStart = charHeight * (j - (myLines.length / 2.0));
		
			for (i = 0; i < N; i++)
			{
				var xCharOffset = i * A;

				for (var y = 0; y < pixelsHigh; y++)
				{
					for (var x = 0; x < pixelsWide; x++)
					{
						var xPixelOffset = x * p_pixelWidth;
						var yPixelOffset = y * p_pixelHeight;

						if (this.GetFontData(myLines[j].charCodeAt(i), (pixelsWide - 1) - x, (pixelsHigh - 1) - y))
						{
							for (var k = 0; k < p_pixelsDeep; k++)
							{
								var myX = xStart + xCharOffset + xPixelOffset;
								var myY = yStart + yPixelOffset;
								var myZ = zStart - (k * p_depth * 2.0);

								if (p_depth >= 0)
								{
									var p0 = new Vec3Class(myX + p_pixelGap, myY + p_pixelGap, myZ + p_depth - p_pixelGap);
									var p1 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelGap, myZ + p_depth - p_pixelGap);
									var p2 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ + p_depth - p_pixelGap);
									var p3 = new Vec3Class(myX + p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ + p_depth - p_pixelGap);
									var p4 = new Vec3Class(myX + p_pixelGap, myY + p_pixelGap, myZ - p_depth + p_pixelGap);
									var p5 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelGap, myZ - p_depth + p_pixelGap);
									var p6 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ - p_depth + p_pixelGap);
									var p7 = new Vec3Class(myX + p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ - p_depth + p_pixelGap);

									myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
									myObject.AddQuad(p5, p4, p7, p6, myColour, new Vec3Class(0, 0, -1));
									myObject.AddQuad(p4, p0, p3, p7, myColour, new Vec3Class(-1, 0, 0));
									myObject.AddQuad(p1, p5, p6, p2, myColour, new Vec3Class(1, 0, 0));
									myObject.AddQuad(p3, p2, p6, p7, myColour, new Vec3Class(0, 1, 0));
									myObject.AddQuad(p4, p5, p1, p0, myColour, new Vec3Class(0, -1, 0));
								}
								else 
								{
									var p0 = new Vec3Class(myX + p_pixelGap, myY + p_pixelGap, myZ);
									var p1 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelGap, myZ);
									var p2 = new Vec3Class(myX + p_pixelWidth - p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ);
									var p3 = new Vec3Class(myX + p_pixelGap, myY + p_pixelHeight - p_pixelGap, myZ);

									myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
								}
							}
						}
					}
				}
			}
		}

		return myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
	}

	CreateText(p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		if (this.textureURL == null) return this.CreateTextFromDOSFont(p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour);

        var myTextureId = this.myOpenGLRef.myTextureManager.LoadTexture(this.textureURL).id;
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
		var A = p_pixelWidth * this.xPitch;	// A is the nominal width of each character equivalent to the non-textured version
        var charHeight = p_pixelHeight * this.yPitch;
        var myFaceIndex = myObject.AddFace(i);
        var myColour = p_colour.AsVec3();
        var i, j;
        var myLength = p_text.length;
        var myLines = this.ConvertToLines(p_text);

 		for (j = 0; j < myLines.length; j++)
 		{
 			var N = myLines[j].length;
 			var xStart = -(N * A) / 2.0;
 			var yStart = charHeight * ((myLines.length / 2.0) - j);

	        for (i = 0; i < N; i++)
	        {
		        var xEnd = xStart + A;
		        var p0 = new Vec3Class(xStart, yStart - charHeight, 0);
		        var p1 = new Vec3Class(xEnd, yStart - charHeight, 0);
		        var p2 = new Vec3Class(xEnd, yStart, 0);
		        var p3 = new Vec3Class(xStart, yStart, 0);

	        	// Get location of this character within the texture bitmap
	        	var charIndex = myLines[j].charCodeAt(i) - 32;
	        	var xPos = charIndex % this.charsPerLine;
	        	var yPos = Math.floor(charIndex / this.charsPerLine);
	        	var x0 = this.xOrig + (xPos * this.xPitch);
	        	var y0 = this.yOrig + (yPos * this.yPitch);
	        	var x1 = this.xOrig + ((xPos + 1) * this.xPitch);
	        	var y1 = this.yOrig + ((yPos + 1) * this.yPitch);

	        	x0 /= this.bitmapWidth;
	        	y0 /= this.bitmapHeight;
	        	x1 /= this.bitmapWidth;
	        	y1 /= this.bitmapHeight;
	        	y0 = 1.0 - y0;
	        	y1 = 1.0 - y1;

		        myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
		        myObject.AddQuadTexture(myFaceIndex, myTextureId, x0, y1, x1, y0);

		        xStart = xEnd;
	    	}
    	}

		return myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
	}

	CreateTextFromTextureProportional(p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		var xOrig = 17, yOrig = 35, xPitch = 58, yPitch = 96, charsPerLine = 16, myWidth = 1024, myHeight = 1024;
        var myTextureObject = this.myOpenGLRef.myTextureManager.LoadTexture(p_font).textureRef;
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
		const pixelsWide = 8, pixelsHigh = 12;
		var A = p_pixelWidth * pixelsWide;	// A is the nominal width of each character equivalent to the non-textured version
        var charHeight = pixelsHigh * p_pixelHeight;
        var myFaceIndex = myObject.AddFace(i);
        var myColour = p_colour.AsVec3();
        var i, j, myLines = [], startIndex = 0;
        var myLength = p_text.length;
        var myGap = 6;

		for (i = 0; i < myLength; i++)
		{
			// Look for \n newline character
			if (p_text.charCodeAt(i) == 10)
			{
				// Add the text up to this \n to myLines
				myLines.push(p_text.substring(startIndex, i));
				startIndex = i + 1;
			}
		}

		// Add any remaining text to myLines
		if (startIndex < myLength) myLines.push(p_text.substring(startIndex));
 
 		for (j = 0; j < myLines.length; j++)
 		{
 			var N = myLines[j].length;

 			// Calculate the actual width of the proportionally spaced line
 			var lineWidth = 0;

 			for (i = 0; i < N; i++)
 			{
 				var charIndex = myLines[j].charCodeAt(i) - 32;
 				var a = this.Get_a(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var b = this.Get_b(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var c = (b - a) + 1;
 				var A_dashed = (A * c) / xPitch;

 				lineWidth += A_dashed; 
 			}	

 			var xStart = -lineWidth / 2.0;
 			var yStart = charHeight * ((myLines.length / 2.0) - j);

	        for (i = 0; i < N; i++)
	        {
 				var charIndex = myLines[j].charCodeAt(i) - 32;
 				var a = this.Get_a(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var b = this.Get_b(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var c = (b - a) + 1;
 				var A_dashed = (A * c) / xPitch;

		        var xEnd = xStart + A_dashed;
		        var p0 = new Vec3Class(xStart, yStart - charHeight, 0);
		        var p1 = new Vec3Class(xEnd, yStart - charHeight, 0);
		        var p2 = new Vec3Class(xEnd, yStart, 0);
		        var p3 = new Vec3Class(xStart, yStart, 0);

	        	// Get location of this character within the texture bitmap
	        	var xPos = charIndex % charsPerLine;
	        	var yPos = Math.floor(charIndex / charsPerLine);
	        	//var x0 = xOrig + (xPos * xPitch);
	        	var x0 = a;
	        	var y0 = yOrig + (yPos * yPitch);
	        	//var x1 = xOrig + ((xPos + 1) * xPitch) - 1;
	        	var x1 = b;
	        	var y1 = yOrig + ((yPos + 1) * yPitch) - 1;

	        	x0 /= (myWidth - 1);
	        	y0 /= (myHeight - 1);
	        	x1 /= (myWidth - 1);
	        	y1 /= (myHeight - 1);

	        	y0 = 1.0 - y0;
	        	y1 = 1.0 - y1;

		        myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
		        myObject.AddQuadTexture(myFaceIndex, 1, x0, y1, x1, y0);

		        xStart = xEnd;
	    	}
    	}

		return myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
	}

	Get_a(p_charIndex, p_xOrig, p_xPitch, p_charsPerLine, p_gap)
	{
		var a = this.textureOffsets[p_charIndex * 2];
		var min_a = p_xOrig + ((p_charIndex % p_charsPerLine) * p_xPitch);

		a -= p_gap;

		if (a < min_a) a = min_a;

		return a;
	}

	Get_b(p_charIndex, p_xOrig, p_xPitch, p_charsPerLine, p_gap)
	{
		var b = this.textureOffsets[(p_charIndex * 2) + 1];
		var max_b = p_xOrig + (((p_charIndex % p_charsPerLine) + 1) * p_xPitch) - 1;

		b += p_gap;

		if (b > max_b) b = max_b;

		return b;
	}

	GetTextWidth(p_text, p_pixelWidth)
	{
		var i, startIndex = 0, maxLineLength = 0;
		
		for (i = 0; i < p_text.length; i++)
		{
			// Check for \n newline character
			if (p_text.charCodeAt(i) == 10)
			{
				let myLineLength = p_text.substring(startIndex, i).length;

				if (myLineLength > maxLineLength) maxLineLength = myLineLength;

				startIndex = i + 1;				
			}
		}

		if (startIndex < p_text.length)
		{
			let myLineLength = p_text.substring(startIndex).length;

			if (myLineLength > maxLineLength) maxLineLength = myLineLength;
		}

		return maxLineLength * this.xPitch * p_pixelWidth;		
	}

	GetTextHeight(p_text, p_pixelHeight)
	{
		var numberOfLines = this.ConvertToLines(p_text).length;

		return numberOfLines * this.yPitch * p_pixelHeight;
	}
}

class TextClass
{
	constructor(p_openGLRef)
	{
		this.myOpenGLRef = p_openGLRef;
		var lucidaConsole10FontURL = "../Common/images/LucidaConsole10.png";
		var lucidaConsole12FontURL = "../Common/images/LucidaConsole12.png";
		var lucidaConsole12BoldFontURL = "../Common/images/LucidaConsole12_Bold.png";
		var lucidaConsole14FontURL = "../Common/images/LucidaConsole14.png";
		var lucidaConsole14BoldFontURL = "../Common/images/LucidaConsole14_Bold.png";
		var lucidaConsole18FontURL = "../Common/images/LucidaConsole18.png";
		var lucidaConsole18BoldFontURL = "../Common/images/LucidaConsole18_Bold.png";
		var lucidaConsole24FontURL = "../Common/images/LucidaConsole24.png";
		var lucidaConsole36FontURL = "../Common/images/LucidaConsole36.png";
		var lucidaConsole72FontURL = "../Common/images/LucidaConsole72.png";
		this.myFonts = [];

		var myDosFont = new FontClass(this.myOpenGLRef, "dosFont");

		this.myFonts.push(myDosFont);

		// Numbers are: xOrig yOrig xPitch yPitch charsPerLine imageWidth imageHeight
		var myLucidaConsole10Font = new FontClass(this.myOpenGLRef, "lucidaConsole10", lucidaConsole10FontURL, 4, 4, 8, 13, 14, 128, 128);
		var myLucidaConsole12Font = new FontClass(this.myOpenGLRef, "lucidaConsole12", lucidaConsole12FontURL, 11, 15, 10, 16, 16, 256, 256);
		var myLucidaConsole12BoldFont = new FontClass(this.myOpenGLRef, "lucidaConsole12_bold", lucidaConsole12BoldFontURL, 3, 3, 11, 16, 16, 256, 256);
		var myLucidaConsole14Font = new FontClass(this.myOpenGLRef, "lucidaConsole14", lucidaConsole14FontURL, 4, 4, 11, 19, 16, 256, 256);
		var myLucidaConsole14BoldFont = new FontClass(this.myOpenGLRef, "lucidaConsole14_bold", lucidaConsole14BoldFontURL, 6, 9, 12, 19, 16, 256, 256);
		var myLucidaConsole18Font = new FontClass(this.myOpenGLRef, "lucidaConsole18", lucidaConsole18FontURL, 1, 2, 14, 24, 16, 256, 256);
		var myLucidaConsole18BoldFont = new FontClass(this.myOpenGLRef, "lucidaConsole18_bold", lucidaConsole18BoldFontURL, 2, 3, 15, 24, 16, 256, 256);
		var myLucidaConsole24Font = new FontClass(this.myOpenGLRef, "lucidaConsole24", lucidaConsole24FontURL, 1, 0, 19, 32, 13, 256, 256);
		var myLucidaConsole36Font = new FontClass(this.myOpenGLRef, "lucidaConsole36", lucidaConsole36FontURL, 3, 3, 29, 48, 16, 512, 512);
		var myLucidaConsole72Font = new FontClass(this.myOpenGLRef, "lucidaConsole72", lucidaConsole72FontURL, 17, 34, 58, 96, 16, 1024, 1024);
		//var myLucidaConsole72FontProportional = new FontClass(this.myOpenGLRef, "lucidaConsole72", this.LucidaConsole72FontURL, 17, 34, 58, 96, 16, 1024, 1024);

		this.myFonts.push(myLucidaConsole10Font);
		this.myFonts.push(myLucidaConsole12Font);
		this.myFonts.push(myLucidaConsole12BoldFont);
		this.myFonts.push(myLucidaConsole14Font);
		this.myFonts.push(myLucidaConsole14BoldFont);
		this.myFonts.push(myLucidaConsole18Font);
		this.myFonts.push(myLucidaConsole18BoldFont);
		this.myFonts.push(myLucidaConsole24Font);
		this.myFonts.push(myLucidaConsole36Font);
		this.myFonts.push(myLucidaConsole72Font);

		// Allow a pixel area of 8 pixels wide by 12 pixels heigh for each character. Most characters start on the second row except things like $
		// The right column is left blank for character spacing except for the ~ character. There is no spacing built in vertically but most characters do not use the top row
		// Just realised that all characters need to be shifted one pixel left so multiply by 2, except Chr(126), and Chr(127) which are correct
		this.fontData = [
		{charCode:32, data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
		{charCode:33, data:[0, 24, 60, 60, 60, 24, 24, 0, 24, 24, 0, 0]},
		{charCode:34, data:[0, 51, 51, 51, 18, 0, 0, 0, 0, 0, 0, 0]},
		{charCode:35, data:[0, 54, 54, 127, 54, 54, 54, 127, 54, 54, 0, 0]},
		{charCode:36, data:[24, 24, 62, 96, 96, 60, 6, 6, 124, 24, 24, 0]},
		{charCode:37, data:[0, 0, 0, 98, 102, 12, 24, 48, 102, 70, 0, 0]},
		{charCode:38, data:[0, 56, 108, 108, 56, 125, 111, 102, 110, 59, 0, 0]},
		{charCode:39, data:[0, 24, 24, 24, 48, 0, 0, 0, 0, 0, 0, 0]},
		{charCode:40, data:[0, 6, 12, 24, 48, 48, 48, 24, 12, 6, 0, 0]},
		{charCode:41, data:[0, 48, 24, 12, 6, 6, 6, 12, 24, 48, 0, 0]},
		{charCode:42, data:[0, 0, 0, 51, 30, 127, 30, 51, 0, 0, 0, 0]},
		{charCode:43, data:[0, 0, 0, 12, 12, 63, 12, 12, 0, 0, 0, 0]},
		{charCode:44, data:[0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 48, 0]},
		{charCode:45, data:[0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0]},
		{charCode:46, data:[0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 0, 0]},
		{charCode:47, data:[0, 0, 1, 3, 6, 12, 24, 48, 96, 64, 0, 0]},

		{charCode:48, data:[0, 62, 99, 103, 111, 107, 123, 115, 99, 62, 0, 0]},
		{charCode:49, data:[0, 8, 24, 120, 24, 24, 24, 24, 24, 126, 0, 0]},
		{charCode:50, data:[0, 60, 102, 102, 6, 12, 24, 48, 102, 126, 0, 0]},
		{charCode:51, data:[0, 60, 102, 6, 6, 28, 6, 6, 102, 60, 0, 0]},
		{charCode:52, data:[0, 6, 14, 30, 54, 102, 127, 6, 6, 15, 0, 0]},
		{charCode:53, data:[0, 126, 96, 96, 96, 124, 6, 6, 102, 60, 0, 0]},
		{charCode:54, data:[0, 28, 48, 96, 96, 124, 102, 102, 102, 60, 0, 0]},
		{charCode:55, data:[0, 126, 99, 99, 3, 6, 12, 24, 24, 24, 0, 0]},
		{charCode:56, data:[0, 60, 102, 102, 102, 60, 102, 102, 102, 60, 0, 0]},
		{charCode:57, data:[0, 60, 102, 102, 102, 62, 12, 12, 24, 56, 0, 0]},
		{charCode:58, data:[0, 0, 0, 28, 28, 0, 0, 28, 28, 0, 0, 0]},

		{charCode:59, data:[0, 0, 0, 28, 28, 0, 0, 28, 28, 12, 24, 0]},
		{charCode:60, data:[0, 6, 12, 24, 48, 96, 48, 24, 12, 6, 0, 0]},
		{charCode:61, data:[0, 0, 0, 0, 63, 0, 63, 0, 0, 0, 0, 0]},
		{charCode:62, data:[0, 48, 24, 12, 6, 3, 6, 12, 24, 48, 0, 0]},
		{charCode:63, data:[0, 60, 102, 6, 12, 24, 24, 0, 24, 24, 0, 0]},
		{charCode:64, data:[0, 62, 0x63, 0x63, 0x6f, 0x6f, 0x6f, 0x60, 0x60, 0x3e, 0, 0]},

		{charCode:65, data:[0, 24, 60, 102, 102, 102, 126, 102, 102, 102, 0, 0]},
		{charCode:66, data:[0, 126, 51, 51, 51, 62, 51, 51, 51, 126, 0, 0]},
		{charCode:67, data:[0, 30, 51, 99, 96, 96, 96, 99, 51, 30, 0, 0]},
		{charCode:68, data:[0, 124, 54, 51, 51, 51, 51, 51, 54, 124, 0, 0]},
		{charCode:69, data:[0, 127, 49, 48, 50, 62, 50, 48, 49, 127, 0, 0]},
		{charCode:70, data:[0, 127, 51, 49, 50, 62, 50, 48, 48, 120, 0, 0]},
		{charCode:71, data:[0, 30, 51, 99, 96, 96, 103, 99, 51, 31, 0, 0]},
		{charCode:72, data:[0, 102, 102, 102, 102, 126, 102, 102, 102, 102, 0, 0]},
		{charCode:73, data:[0, 60, 24, 24, 24, 24, 24, 24, 24, 60, 0, 0]},
		{charCode:74, data:[0, 15, 6, 6, 6, 6, 102, 102, 102, 60, 0, 0]},
		{charCode:75, data:[0, 115, 51, 54, 54, 60, 54, 54, 51, 115, 0, 0]},
		{charCode:76, data:[0, 120, 48, 48, 48, 48, 49, 51, 51, 127, 0, 0]},
		{charCode:77, data:[0, 99, 119, 127, 127, 107, 99, 99, 99, 99, 0, 0]},
		{charCode:78, data:[0, 99, 99, 115, 123, 127, 111, 103, 99, 99, 0, 0]},
		{charCode:79, data:[0, 28, 54, 99, 99, 99, 99, 99, 54, 28, 0, 0]},
		{charCode:80, data:[0, 126, 51, 51, 51, 62, 48, 48, 48, 120, 0, 0]},
		{charCode:81, data:[0, 28, 54, 99, 99, 99, 103, 111, 62, 6, 15, 0]},
		{charCode:82, data:[0, 126, 51, 51, 51, 62, 54, 51, 51, 115, 0, 0]},
		{charCode:83, data:[0, 60, 102, 102, 96, 56, 12, 102, 102, 60, 0, 0]},
		{charCode:84, data:[0, 126, 90, 24, 24, 24, 24, 24, 24, 60, 0, 0]},
		{charCode:85, data:[0, 102, 102, 102, 102, 102, 102, 102, 102, 60, 0, 0]},
		{charCode:86, data:[0, 102, 102, 102, 102, 102, 102, 102, 60, 24, 0, 0]},
		{charCode:87, data:[0, 99, 99, 99, 99, 107, 107, 54, 54, 54, 0, 0]},
		{charCode:88, data:[0, 102, 102, 102, 60, 24, 60, 102, 102, 102, 0, 0]},
		{charCode:89, data:[0, 102, 102, 102, 102, 60, 24, 24, 24, 60, 0, 0]},
		{charCode:90, data:[0, 127, 103, 76, 12, 24, 48, 49, 99, 127, 0, 0]},

		{charCode:91, data:[0, 30, 24, 24, 24, 24, 24, 24, 24, 30, 0, 0]},
		{charCode:92, data:[0, 0, 64, 96, 48, 24, 12, 6, 3, 1, 0, 0]},
		{charCode:93, data:[0, 30, 6, 6, 6, 6, 6, 6, 6, 30, 0, 0]},
		{charCode:94, data:[8, 28, 54, 99, 0, 0, 0, 0, 0, 0, 0, 0]},
		{charCode:95, data:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0]},
		{charCode:96, data:[24, 24, 12, 0, 0, 0, 0, 0, 0, 0, 128, 0]},

		{charCode:97, data:[0, 0, 0, 0, 60, 6, 62, 102, 102, 59, 0, 0]},
		{charCode:98, data:[0, 112, 48, 48, 62, 51, 51, 51, 51, 110, 0, 0]},
		{charCode:99, data:[0, 0, 0, 0, 60, 102, 96, 96, 102, 60, 0, 0]},
		{charCode:100, data:[0, 14, 6, 6, 62, 102, 102, 102, 102, 59, 0, 0]},
		{charCode:101, data:[0, 0, 0, 0, 60, 102, 126, 96, 102, 60, 0, 0]},
		{charCode:102, data:[0, 28, 54, 48, 48, 124, 48, 48, 48, 120, 0, 0]},
		{charCode:103, data:[0, 0, 0, 0, 59, 102, 102, 102, 62, 6, 102, 60]},
		{charCode:104, data:[0, 112, 48, 48, 54, 59, 51, 51, 51, 115, 0, 0]},
		{charCode:105, data:[0, 12, 12, 0, 60, 12, 12, 12, 12, 63, 0, 0]},
		{charCode:106, data:[0, 6, 6, 0, 30, 6, 6, 6, 6, 102, 102, 60]},
		{charCode:107, data:[0, 112, 48, 48, 51, 54, 60, 54, 51, 115, 0, 0]},
		{charCode:108, data:[0, 60, 12, 12, 12, 12, 12, 12, 12, 63, 0, 0]},
		{charCode:109, data:[0, 0, 0, 0, 126, 107, 107, 107, 107, 99, 0, 0]},
		{charCode:110, data:[0, 0, 0, 0, 124, 102, 102, 102, 102, 102, 0, 0]},
		{charCode:111, data:[0, 0, 0, 0, 60, 102, 102, 102, 102, 60, 0, 0]},
		{charCode:112, data:[0, 0, 0, 0, 110, 51, 51, 51, 51, 62, 48, 120]},
		{charCode:113, data:[0, 0, 0, 0, 59, 102, 102, 102, 102, 62, 6, 15]},
		{charCode:114, data:[0, 0, 0, 0, 118, 55, 59, 48, 48, 120, 0, 0]},
		{charCode:115, data:[0, 0, 0, 0, 60, 102, 48, 12, 102, 60, 0, 0]},
		{charCode:116, data:[0, 0, 16, 48, 126, 48, 48, 48, 54, 28, 0, 0]},
		{charCode:117, data:[0, 0, 0, 0, 102, 102, 102, 102, 102, 59, 0, 0]},
		{charCode:118, data:[0, 0, 0, 0, 102, 102, 102, 102, 60, 24, 0, 0]},
		{charCode:119, data:[0, 0, 0, 0, 99, 99, 107, 107, 54, 54, 0, 0]},
		{charCode:120, data:[0, 0, 0, 0, 99, 54, 28, 28, 54, 99, 0, 0]},
		{charCode:121, data:[0, 0, 0, 0, 51, 51, 51, 51, 30, 6, 12, 120]},
		{charCode:122, data:[0, 0, 0, 0, 126, 70, 12, 48, 98, 126, 0, 0]},

		{charCode:123, data:[0, 14, 24, 24, 48, 96, 48, 24, 24, 14, 0, 0]},
		{charCode:124, data:[0, 12, 12, 12, 12, 0, 12, 12, 12, 12, 0, 0]},
		{charCode:125, data:[0, 112, 24, 24, 12, 6, 12, 24, 24, 112, 0, 0]},
		{charCode:126, data:[0, 0x73, 0xda, 0xce, 0, 0, 0, 0, 0, 0, 0, 0]},
		{charCode:127, data:[0xaa, 0x01, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]}	// This should be DELETE but added a cross-hatch test instead
		];

		this.textureOffsets = [
		27, 64, 98, 108, 145, 179, 193, 246, 259, 296, 307, 364, 366, 422, 445, 458, 497, 531, 546, 580, 605, 646, 659, 707, 735, 748, 781, 818, 851, 864, 891, 941,
		22, 69, 83, 129, 141, 180, 202, 240, 254, 300, 320, 354, 373, 417, 432, 473, 489, 532, 546, 590, 619, 632, 677, 690, 717, 766, 775, 824, 833, 882, 895, 938,
		20, 74, 76, 131, 142, 185, 196, 244, 255, 302, 317, 359, 377, 419, 427, 475, 488, 531, 547, 587, 606, 639, 663, 710, 723, 764, 775, 823, 836, 879, 890, 941,
		28, 71, 78, 132, 142, 189, 199, 243, 250, 305, 314, 356, 366, 421, 424, 479, 482, 537, 541, 596, 602, 650, 676, 704, 716, 766, 779, 807, 833, 882, 887, 944,
		34, 55, 81, 128, 141, 185, 199, 242, 255, 298, 314, 358, 372, 421, 429, 473, 490, 530, 547, 575, 604, 638, 665, 710, 721, 749, 775, 823, 838, 878, 892, 939,
		25, 69, 80, 123, 147, 184, 200, 239, 255, 300, 315, 355, 368, 419, 424, 479, 485, 534, 543, 593, 603, 647, 666, 702, 738, 744, 781, 817, 833, 882
		];
	}

	GetFontData(p_char, p_x, p_y)
	{
	    var result = false;
	    var i, myIndex = -1;
	    
	    for (i = 0; i < this.fontData.length; i++)
	    {
	        if (this.fontData[i].charCode == p_char)
	        {
	            myIndex = i;
	            break;
	        }
	    }
	    
	    if (myIndex >= 0)
	    {
	    	var myAsciiCode = this.fontData[myIndex].charCode;
	    	var myFontData = this.fontData[myIndex].data[p_y];

	    	if (myAsciiCode < 126) myFontData = myFontData << 1;

	        //if (this.fontData[myIndex].data[p_y] & (1 << p_x)) result = true;
	        if (myFontData & (1 << p_x)) result = true;
	    }
	    
	    return result;
	}

	GetFontIndex(p_fontName)
	{
		var i, myIndex = -1;

		for (i = 0; i < this.myFonts.length; i++)
		{
			if (this.myFonts[i].name == p_fontName)
			{
				myIndex = i;
				break;
			}
		}

		return myIndex;
	}
	
	CreateText(p_fontName, p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		var myIndex = this.GetFontIndex(p_fontName);

		if (myIndex >= 0) return this.myFonts[myIndex].CreateText(p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour);
		else return -1;
	}

	GetTextWidth(p_fontName, p_text, p_pixelWidth)
	{
		var myIndex = this.GetFontIndex(p_fontName);

		if (myIndex >= 0) return this.myFonts[myIndex].GetTextWidth(p_text, p_pixelWidth);
		else return -1;
	}

	GetTextHeight(p_fontName, p_text, p_pixelHeight)
	{
		var myIndex = this.GetFontIndex(p_fontName);

		if (myIndex >= 0) return this.myFonts[myIndex].GetTextHeight(p_text, p_pixelHeight);
		else return -1;
	}

	CreateTextFromTexture(p_font, p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		//return this.CreateTextFromTextureProportional(p_font, p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour);

		var xOrig = 17, yOrig = 34, xPitch = 58, yPitch = 96, charsPerLine = 16, myWidth = 1024, myHeight = 1024;
        var myTextureObject = this.myOpenGLRef.myTextureManager.LoadTexture(p_font).textureRef;
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
		const pixelsWide = 8, pixelsHigh = 12;
		var A = p_pixelWidth * pixelsWide;	// A is the nominal width of each character equivalent to the non-textured version
        var charHeight = pixelsHigh * p_pixelHeight;
        var myFaceIndex = myObject.AddFace(i);
        var myColour = p_colour.AsVec3();
        var i, j, myLines = [], startIndex = 0;
        var myLength = p_text.length;

		for (i = 0; i < myLength; i++)
		{
			// Look for \n newline character
			if (p_text.charCodeAt(i) == 10)
			{
				// Add the text up to this \n to myLines
				myLines.push(p_text.substring(startIndex, i));
				startIndex = i + 1;
			}
		}

		// Add any remaining text to myLines
		if (startIndex < myLength) myLines.push(p_text.substring(startIndex));
 
 		for (j = 0; j < myLines.length; j++)
 		{
 			var N = myLines[j].length;
 			var xStart = -(N * A) / 2.0;
 			var yStart = charHeight * ((myLines.length / 2.0) - j);

	        for (i = 0; i < N; i++)
	        {
		        var xEnd = xStart + A;
		        var p0 = new Vec3Class(xStart, yStart - charHeight, 0);
		        var p1 = new Vec3Class(xEnd, yStart - charHeight, 0);
		        var p2 = new Vec3Class(xEnd, yStart, 0);
		        var p3 = new Vec3Class(xStart, yStart, 0);

	        	// Get location of this character within the texture bitmap
	        	var charIndex = myLines[j].charCodeAt(i) - 32;
	        	var xPos = charIndex % charsPerLine;
	        	var yPos = Math.floor(charIndex / charsPerLine);
	        	var x0 = xOrig + (xPos * xPitch);
	        	var y0 = yOrig + (yPos * yPitch);
	        	/*var x1 = xOrig + ((xPos + 1) * xPitch) - 1;
	        	var y1 = yOrig + ((yPos + 1) * yPitch) - 1;

	        	x0 /= (myWidth - 1);
	        	y0 /= (myHeight - 1);
	        	x1 /= (myWidth - 1);
	        	y1 /= (myHeight - 1);*/

	        	var x1 = xOrig + ((xPos + 1) * xPitch);
	        	var y1 = yOrig + ((yPos + 1) * yPitch);

	        	x0 /= myWidth;
	        	y0 /= myHeight;
	        	x1 /= myWidth;
	        	y1 /= myHeight;
	        	y0 = 1.0 - y0;
	        	y1 = 1.0 - y1;

		        myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
		        myObject.AddQuadTexture(myFaceIndex, 1, x0, y1, x1, y0);

		        xStart = xEnd;
	    	}
    	}

		return myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
	}

	CreateTextFromTextureProportional(p_font, p_text, p_pixelWidth, p_pixelHeight, p_depth, p_pixelGap, p_pixelsDeep, p_colour)
	{
		var xOrig = 17, yOrig = 35, xPitch = 58, yPitch = 96, charsPerLine = 16, myWidth = 1024, myHeight = 1024;
        var myTextureObject = this.myOpenGLRef.myTextureManager.LoadTexture(p_font).textureRef;
        var myObject = new OpenGLObjectClass(this.myOpenGLRef.gl);
		const pixelsWide = 8, pixelsHigh = 12;
		var A = p_pixelWidth * pixelsWide;	// A is the nominal width of each character equivalent to the non-textured version
        var charHeight = pixelsHigh * p_pixelHeight;
        var myFaceIndex = myObject.AddFace(i);
        var myColour = p_colour.AsVec3();
        var i, j, myLines = [], startIndex = 0;
        var myLength = p_text.length;
        var myGap = 6;

		for (i = 0; i < myLength; i++)
		{
			// Look for \n newline character
			if (p_text.charCodeAt(i) == 10)
			{
				// Add the text up to this \n to myLines
				myLines.push(p_text.substring(startIndex, i));
				startIndex = i + 1;
			}
		}

		// Add any remaining text to myLines
		if (startIndex < myLength) myLines.push(p_text.substring(startIndex));
 
 		for (j = 0; j < myLines.length; j++)
 		{
 			var N = myLines[j].length;

 			// Calculate the actual width of the proportionally spaced line
 			var lineWidth = 0;

 			for (i = 0; i < N; i++)
 			{
 				var charIndex = myLines[j].charCodeAt(i) - 32;
 				var a = this.Get_a(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var b = this.Get_b(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var c = (b - a) + 1;
 				var A_dashed = (A * c) / xPitch;

 				lineWidth += A_dashed; 
 			}	

 			var xStart = -lineWidth / 2.0;
 			var yStart = charHeight * ((myLines.length / 2.0) - j);

	        for (i = 0; i < N; i++)
	        {
 				var charIndex = myLines[j].charCodeAt(i) - 32;
 				var a = this.Get_a(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var b = this.Get_b(charIndex, xOrig, xPitch, charsPerLine, myGap);
 				var c = (b - a) + 1;
 				var A_dashed = (A * c) / xPitch;

		        var xEnd = xStart + A_dashed;
		        var p0 = new Vec3Class(xStart, yStart - charHeight, 0);
		        var p1 = new Vec3Class(xEnd, yStart - charHeight, 0);
		        var p2 = new Vec3Class(xEnd, yStart, 0);
		        var p3 = new Vec3Class(xStart, yStart, 0);

	        	// Get location of this character within the texture bitmap
	        	var xPos = charIndex % charsPerLine;
	        	var yPos = Math.floor(charIndex / charsPerLine);
	        	//var x0 = xOrig + (xPos * xPitch);
	        	var x0 = a;
	        	var y0 = yOrig + (yPos * yPitch);
	        	//var x1 = xOrig + ((xPos + 1) * xPitch) - 1;
	        	var x1 = b;
	        	var y1 = yOrig + ((yPos + 1) * yPitch) - 1;

	        	x0 /= (myWidth - 1);
	        	y0 /= (myHeight - 1);
	        	x1 /= (myWidth - 1);
	        	y1 /= (myHeight - 1);

	        	y0 = 1.0 - y0;
	        	y1 = 1.0 - y1;

		        myObject.AddQuad(p0, p1, p2, p3, myColour, new Vec3Class(0, 0, 1));
		        myObject.AddQuadTexture(myFaceIndex, 1, x0, y1, x1, y0);

		        xStart = xEnd;
	    	}
    	}

		return myObject.AddToVBO(this.myOpenGLRef.modelVBO).GetVBOObjectIndex();
	}

	Get_a(p_charIndex, p_xOrig, p_xPitch, p_charsPerLine, p_gap)
	{
		var a = this.textureOffsets[p_charIndex * 2];
		var min_a = p_xOrig + ((p_charIndex % p_charsPerLine) * p_xPitch);

		a -= p_gap;

		if (a < min_a) a = min_a;

		return a;
	}

	Get_b(p_charIndex, p_xOrig, p_xPitch, p_charsPerLine, p_gap)
	{
		var b = this.textureOffsets[(p_charIndex * 2) + 1];
		var max_b = p_xOrig + (((p_charIndex % p_charsPerLine) + 1) * p_xPitch) - 1;

		b += p_gap;

		if (b > max_b) b = max_b;

		return b;
	}
}

function CalculateNormal(p0, p1, p2)
{
    var ax = p1.x - p0.x;
    var ay = p1.y - p0.y;
    var az = p1.z - p0.z;
    var bx = p2.x - p0.x;
    var by = p2.y - p0.y;
    var bz = p2.z - p0.z;
    var cx = (ay * bz) - (az * by);
    var cy = (az * bx) - (ax * bz);
    var cz = (ax * by) - (ay * bx);
    var f = Math.sqrt((cx * cx) + (cy * cy) + (cz * cz));
    var result = new Vec3Class(cx / f, cy / f, cz / f);
    
    return result;
}

function DegreesToRadians(p)
{
    return p * Math.PI / 180.0;
}

function Round(p_number, p_decimalPlaces)
{
    if (p_decimalPlaces === undefined) return Math.round(p_number);
    else
    {
        var myPower = Math.pow(10, p_decimalPlaces);

        return Math.round(myPower * p_number) / myPower;
    }
}

function Sign(p0, p1, p2)
{
    return ((p0.x - p2.x) * (p1.y - p2.y)) - ((p1.x - p2.x) * (p0.y - p2.y));
}

function PointInTriangle(p_point, p_v0, p_v1, p_v2)
{
    var d0, d1, d2;
    var hasNeg, hasPos;

    d0 = Sign(p_point, p_v0, p_v1);
    d1 = Sign(p_point, p_v1, p_v2);
    d2 = Sign(p_point, p_v2, p_v0);

    hasNeg = (d0 < 0) || (d1 < 0) || (d2 < 0);
    hasPos = (d0 > 0) || (d1 > 0) || (d2 > 0);

    return !(hasNeg && hasPos);
}

function Interpolate(p0, p1, p_fraction)
{
    var result = new Vec3Class(p0.x, p0.y, p0.z);

    result.x += p_fraction * (p1.x - p0.x);
    result.y += p_fraction * (p1.y - p0.y);
    result.z += p_fraction * (p1.z - p0.z);

    return result;
}

function WithinRange(p, p_lowerLeft, p_upperRight)
{
    var result = false;
    
    if (p.x >= p_lowerLeft.x)
    {
        if (p.x <= p_upperRight.x)
        {
            if (p.y >= p_lowerLeft.y)
            {
                if (p.y <= p_upperRight.y) result = true;
            }
        }
    }

    return result;
}

function PropertyExists(p_object, p_path)
{
    var i, myFields = p_path.split("."), myObject = p_object, result = true;
  
    if (myObject === undefined) return false;
    if (myObject == null) return false;
    if (p_path == "") return true;
  
    for (i = 0; i < myFields.length; i++)
    {
        myObject = myObject[myFields[i]];

        if (myObject === undefined)
        {
            result = false;
            break;
        }
        else
        {
            if (myObject == null)
            {
                result = false;
                break;
            }
        }
    }
  
    return result;
}

class VAOClass
{
    constructor(p_glRef_or_openGLRef)
    {
        if (p_glRef_or_openGLRef.gl === undefined)
        {
            this.glRef = p_glRef_or_openGLRef;
            this.myOpenGLRef = null;
        }
        else
        {
            this.glRef = p_glRef_or_openGLRef.gl;
            this.myOpenGLRef = p_glRef_or_openGLRef;
        }

        this.vaoBufferIds = [];
        this.myObjects = [];
        this.identityModelMatrix = new MatrixClass(true);
        this.useNormals = true;
    }
    
    AddObject(p_object)
    {
        this.myObjects.push(p_object);
        
        return this.myObjects.length - 1;
    }
    
    Enable()
    {
        var i;

        for (i = 0; i < this.myObjects.length; i++)
        {
        	var bytesRequired = 0, vboBufferId = -1, vaoBufferId = -1;
            var myRef = this.myObjects[i];
             
            bytesRequired += myRef.GetVertexAndColourByteCount();
             
            if (this.useNormals) bytesRequired += myRef.GetNormalByteCount();

	        // Generate the VAO instance
	        vaoBufferId = this.glRef.createVertexArray();
	        this.vaoBufferIds.push(vaoBufferId);

	        // Bind vertex array object (VAO)
	        this.glRef.bindVertexArray(vaoBufferId);
        
        	// Generate the buffer id
        	vboBufferId = this.glRef.createBuffer();

	        // Bind vertex buffer (VBO) and reserve space
	        this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, vboBufferId);
	        this.glRef.bufferData(this.glRef.ARRAY_BUFFER, bytesRequired, this.glRef.STATIC_DRAW);

	        // Copy vertex co-ordinate data into first half of vertex buffer and vertex colour data into second half of vertex buffer        
	        var bufferOffset = 0;
	        var bytesForThisChunk = myRef.GetVertexAndColourByteCount();
	            
	        this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetVBOData());
	        bufferOffset += bytesForThisChunk;

            if (this.useNormals)
            {
                bytesForThisChunk = myRef.GetNormalByteCount();
                this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetNormalsVBOData());
                bufferOffset += bytesForThisChunk;
            }

            // Now prepare everything for the Draw ..
            var bufferOffset = 0;

            this.glRef.enableVertexAttribArray(myActiveProgramRef.aVertexPosition);
            bytesForThisChunk = myRef.GetVertexByteCount();
            this.glRef.vertexAttribPointer(myActiveProgramRef.aVertexPosition, 3, this.glRef.FLOAT, false, 0, bufferOffset);
            bufferOffset += bytesForThisChunk;

            this.glRef.enableVertexAttribArray(myActiveProgramRef.uModelColour);
            bytesForThisChunk = myRef.GetColourByteCount();
            this.glRef.vertexAttribPointer(myActiveProgramRef.uModelColour, 3, this.glRef.FLOAT, false, 0, bufferOffset);
            bufferOffset += bytesForThisChunk;

            if (this.useNormals)
            {
	            this.glRef.enableVertexAttribArray(myActiveProgramRef.aNormal);
	            bytesForThisChunk = myRef.GetNormalByteCount();
	            this.glRef.vertexAttribPointer(myActiveProgramRef.aNormal, 3, this.glRef.FLOAT, false, 0, bufferOffset);
	            bufferOffset += bytesForThisChunk;            	
            }

          	this.glRef.bindVertexArray(null);
          	this.glRef.bindBuffer(this.glRef.ELEMENT_ARRAY_BUFFER);
        }
    }
    
    Draw(p_modelMatrixRef, p_vaoObjectIndex)
    {
        var myActiveProgramRef = null;
        var drawArraysCalls = 0;

        if (this.myOpenGLRef == null) myActiveProgramRef = myActiveProgram;
        else myActiveProgramRef = this.myOpenGLRef.myActiveProgram;

        for (var i = 0; i < this.myObjects.length; i++)
        {
            if ((p_vaoObjectIndex == -1) || (p_vaoObjectIndex == i))
            {
                if (p_modelMatrixRef == null) this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, this.identityModelMatrix.m);
                else this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, p_modelMatrixRef.m);
                
                this.glRef.bindVertexArray(this.vaoBufferIds[i]);
                this.glRef.drawArrays(this.myObjects[i].openGLObjectType, 0, this.myObjects[i].GetVertexCount());
                this.glRef.bindVertexArray(null);
                drawArraysCalls++;
            }
        }
  
        this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, null);

        return drawArraysCalls;
    }	
}

class VBOClass
{
    constructor(p_glRef_or_openGLRef)
    {
        if (p_glRef_or_openGLRef.gl === undefined)
        {
            this.glRef = p_glRef_or_openGLRef;
            this.myOpenGLRef = null;
        }
        else
        {
            this.glRef = p_glRef_or_openGLRef.gl;
            this.myOpenGLRef = p_glRef_or_openGLRef;
        }

        this.myObjects = [];
        this.vboBufferId = -1;
        this.identityModelMatrix = new MatrixClass(true);
        this.useNormals = true;
        this.runAsVao = false;
        this.useTextures = false;
        this.vaoBufferIds = [];
    }
    
    Clear()
    {
        this.myObjects = [];

        if (this.vboBufferId >= 0)
        {
            this.glRef.deleteBuffer(this.vboBufferId);
            this.vboBufferId = -1;
        }
    }

    AddObject(p_object)
    {
        this.myObjects.push(p_object);
        
        return this.myObjects.length - 1;
    }
    
    Enable()
    {
        if (this.runAsVao) this.Enable_VAO();
        else
        {
            var i, totalBytesRequired = 0, bufferOffset = 0, vertexCount = 0;

            for (i = 0; i < this.myObjects.length; i++)
            {
                 var myRef = this.myObjects[i];
                 var bytesRequired = 0;
                 
                 //if (i == 75) alert(0);
                 bytesRequired += myRef.GetVertexAndColourByteCount();
                 
                 if (this.useNormals) bytesRequired += myRef.GetNormalByteCount();
                 if (this.useTextures && myRef.UsingTextures()) bytesRequired += myRef.GetTextureByteCount();

                 myRef.SetVBOBufferOffset(bufferOffset);
                 bufferOffset += bytesRequired;
                 totalBytesRequired += bytesRequired;
            }

            // Generate the buffer id
            this.vboBufferId = this.glRef.createBuffer();
            
            // Bind vertex buffer (VBO) and reserve space
            this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, this.vboBufferId);
            this.glRef.bufferData(this.glRef.ARRAY_BUFFER, totalBytesRequired, this.glRef.STATIC_DRAW);
            
            // Copy vertex data, then colour data for each object into the VBO (GL_ARRAY_BUFFER)
            bufferOffset = 0;

            for (i = 0; i < this.myObjects.length; i++)
            {
                var myRef = this.myObjects[i];
                var bytesForThisChunk = this.myObjects[i].GetVertexAndColourByteCount();

                myRef.SetVBOVertexIndex(vertexCount);
                this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetVBOData());
                bufferOffset += bytesForThisChunk;

                if (this.useNormals)
                {
                    bytesForThisChunk = myRef.GetNormalByteCount();
                    this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetNormalsVBOData());
                    bufferOffset += bytesForThisChunk;
                }

                if (this.useTextures && myRef.UsingTextures())
                {
                    bytesForThisChunk = myRef.GetTextureByteCount();
                    this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetTextureVBOData());
                    bufferOffset += bytesForThisChunk;
                }
                
                vertexCount += myRef.GetVertexCount();
            }
            
            this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, null);
        }
    }
    
    Draw(p_modelMatrixRef, p_vboObjectIndex)
    {
        if (this.runAsVao) return this.Draw_VAO(p_modelMatrixRef, p_vboObjectIndex);
        else
        {
            var i;
            var myActiveProgramRef = null;
            var drawArraysCalls = 0;
            var myStartObjectIndex = 0, myEndObjectIndex = this.myObjects.length - 1;

            if (this.myOpenGLRef == null) myActiveProgramRef = myActiveProgram;
            else myActiveProgramRef = this.myOpenGLRef.myActiveProgram;

            this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, this.vboBufferId);
     
            if (p_vboObjectIndex >= 0)
            {
                myStartObjectIndex = p_vboObjectIndex;
                myEndObjectIndex = p_vboObjectIndex;
            }

            for (i = myStartObjectIndex; i <= myEndObjectIndex; i++)
            {
                var myRef = this.myObjects[i];
                var bufferOffset = myRef.GetVBOBufferOffset()
                var bytesForThisChunk;

                this.glRef.disableVertexAttribArray(myActiveProgramRef.aTexCoord);
                bytesForThisChunk = myRef.GetVertexByteCount();

                this.glRef.vertexAttribPointer(myActiveProgramRef.aVertexPosition, 3, this.glRef.FLOAT, false, 0, bufferOffset);
                this.glRef.enableVertexAttribArray(myActiveProgramRef.aVertexPosition);
        
                bufferOffset += bytesForThisChunk;
                bytesForThisChunk = myRef.GetColourByteCount();
                
                this.glRef.vertexAttribPointer(myActiveProgramRef.uModelColour, 3, this.glRef.FLOAT, false, 0, bufferOffset);
                this.glRef.enableVertexAttribArray(myActiveProgramRef.uModelColour);

                bufferOffset += bytesForThisChunk;
                
                if (this.useNormals)
                {
                    bytesForThisChunk = myRef.GetNormalByteCount();
                    
                    if (myActiveProgramRef.aNormal >= 0)
                    {
                        this.glRef.vertexAttribPointer(myActiveProgramRef.aNormal, 3, this.glRef.FLOAT, false, 0, bufferOffset);
                        this.glRef.enableVertexAttribArray(myActiveProgramRef.aNormal);
                    }

                    bufferOffset += bytesForThisChunk;
                }

                if (this.useTextures && myRef.UsingTextures())
                {
                    bytesForThisChunk = myRef.GetTextureByteCount();
                    
                    if (myActiveProgramRef.aTexCoord >= 0)
                    {
                        this.glRef.vertexAttribPointer(myActiveProgramRef.aTexCoord, 2, this.glRef.FLOAT, false, 0, bufferOffset);
                        this.glRef.enableVertexAttribArray(myActiveProgramRef.aTexCoord);
                    }

                    bufferOffset += bytesForThisChunk;
                }

                if ((p_vboObjectIndex == -1) || (p_vboObjectIndex == i))
                {
                    if (p_modelMatrixRef == null) this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, this.identityModelMatrix.m);
                    else this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, p_modelMatrixRef.m);
                    
                    if (myRef.GetNumberOfFaces() > 0)
                    {
                        var myLastTexture = -1;
                        var myStart = 0;
                        var myCount = 0;
                        var myNumberOfFaces = myRef.GetNumberOfFaces();

                        for (var j = 0; j < myNumberOfFaces; j++)
                        {
                            if (myRef.GetFaceRef(j).GetTextureId() != myLastTexture)
                            {
                                // Draw anything up to this point
                                if (myCount > 0) this.glRef.drawArrays(myRef.openGLObjectType, myStart, myCount);

                                // If we were using a different texture then unbind it
                                if (myLastTexture > 0) this.myOpenGLRef.UnbindTexture();

                                myLastTexture = myRef.GetFaceRef(j).GetTextureId();
                                myStart = myRef.GetFaceRef(j).GetStartingVertexIndex();
                                myCount = 0;

                                if (myLastTexture > 0) this.myOpenGLRef.BindTexture(this.myOpenGLRef.myTextureManager.GetTextureRef(myLastTexture));
                            }

                            if (j < (myNumberOfFaces - 1)) myCount += myRef.GetFaceRef(j + 1).GetStartingVertexIndex() - myRef.GetFaceRef(j).GetStartingVertexIndex();
                            else myCount += myRef.GetVertexCount() - myRef.GetFaceRef(j).GetStartingVertexIndex();
                        }

                        this.glRef.drawArrays(myRef.openGLObjectType, myStart, myCount);

                        if (myLastTexture > 0) this.myOpenGLRef.UnbindTexture();
                    }
                    else this.glRef.drawArrays(myRef.openGLObjectType, 0, myRef.GetVertexCount());
                    
                    drawArraysCalls++;
                }
            }
      
            this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, null);

            return drawArraysCalls;
        }
    }

    Enable_VAO()
    {
        var i;
        var myActiveProgramRef = null;

        if (this.myOpenGLRef == null) myActiveProgramRef = myActiveProgram;
        else myActiveProgramRef = this.myOpenGLRef.myActiveProgram;

        for (i = 0; i < this.myObjects.length; i++)
        {
            var bytesRequired = 0, vboBufferId = -1, vaoBufferId = -1;
            var myRef = this.myObjects[i];
             
            bytesRequired += myRef.GetVertexAndColourByteCount();
             
            if (this.useNormals) bytesRequired += myRef.GetNormalByteCount();

            // Generate the VAO instance
            vaoBufferId = this.glRef.createVertexArray();
            this.vaoBufferIds.push(vaoBufferId);

            // Bind vertex array object (VAO)
            this.glRef.bindVertexArray(vaoBufferId);
        
            // Generate the buffer id
            vboBufferId = this.glRef.createBuffer();

            // Bind vertex buffer (VBO) and reserve space
            this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, vboBufferId);
            this.glRef.bufferData(this.glRef.ARRAY_BUFFER, bytesRequired, this.glRef.STATIC_DRAW);

            // Copy vertex co-ordinate data into first half of vertex buffer and vertex colour data into second half of vertex buffer        
            var bufferOffset = 0;
            var bytesForThisChunk = myRef.GetVertexAndColourByteCount();
                
            this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetVBOData());
            bufferOffset += bytesForThisChunk;

            if (this.useNormals)
            {
                bytesForThisChunk = myRef.GetNormalByteCount();
                this.glRef.bufferSubData(this.glRef.ARRAY_BUFFER, bufferOffset, myRef.GetNormalsVBOData());
                bufferOffset += bytesForThisChunk;
            }

            // Now prepare everything for the Draw ..
            var bufferOffset = 0;

            this.glRef.enableVertexAttribArray(myActiveProgramRef.aVertexPosition);
            bytesForThisChunk = myRef.GetVertexByteCount();
            this.glRef.vertexAttribPointer(myActiveProgramRef.aVertexPosition, 3, this.glRef.FLOAT, false, 0, bufferOffset);
            bufferOffset += bytesForThisChunk;

            this.glRef.enableVertexAttribArray(myActiveProgramRef.uModelColour);
            bytesForThisChunk = myRef.GetColourByteCount();
            this.glRef.vertexAttribPointer(myActiveProgramRef.uModelColour, 3, this.glRef.FLOAT, false, 0, bufferOffset);
            bufferOffset += bytesForThisChunk;

            if (this.useNormals)
            {
                this.glRef.enableVertexAttribArray(myActiveProgramRef.aNormal);
                bytesForThisChunk = myRef.GetNormalByteCount();
                this.glRef.vertexAttribPointer(myActiveProgramRef.aNormal, 3, this.glRef.FLOAT, false, 0, bufferOffset);
                bufferOffset += bytesForThisChunk;              
            }

            this.glRef.bindVertexArray(null);
            this.glRef.bindBuffer(this.glRef.ELEMENT_ARRAY_BUFFER, null);
        }
    }
    
    Draw_VAO(p_modelMatrixRef, p_vaoObjectIndex)
    {
        var myActiveProgramRef = null;
        var drawArraysCalls = 0;

        if (this.myOpenGLRef == null) myActiveProgramRef = myActiveProgram;
        else myActiveProgramRef = this.myOpenGLRef.myActiveProgram;

        for (var i = 0; i < this.myObjects.length; i++)
        {
            if ((p_vaoObjectIndex == -1) || (p_vaoObjectIndex == i))
            {
                if (p_modelMatrixRef == null) this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, this.identityModelMatrix.m);
                else this.glRef.uniformMatrix4fv(myActiveProgramRef.modelMatrix, false, p_modelMatrixRef.m);
                
                this.glRef.bindVertexArray(this.vaoBufferIds[i]);
                this.glRef.drawArrays(this.myObjects[i].openGLObjectType, 0, this.myObjects[i].GetVertexCount());
                this.glRef.bindVertexArray(null);
                drawArraysCalls++;
            }
        }
  
        //this.glRef.bindBuffer(this.glRef.ARRAY_BUFFER, null);

        return drawArraysCalls;
    }
    
    RunAsVAO()
    {
        this.runAsVao = true;
    }

    EnableTextures()
    {
        this.useTextures = true;
    }
}


class Vec3Class
{
    constructor(p_x, p_y, p_z)
    {
        this.x = p_x;
        this.y = p_y;
        this.z = p_z;
    }

    Magnitude()
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }
    
    Normalise()
    {
        var m = this.Magnitude();
        
        this.x /= m;
        this.y /= m;
        this.z /= m;
    }
    
    CopyFrom(p)
    {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        
        return this;
    }

    Set(p_x, p_y, p_z)
    {
        this.x = p_x;
        this.y = p_y;
        this.z = p_z;
    }
}

class Vec4Class
{
    constructor(p_x, p_y, p_z, p_w)
    {
        this.x = p_x;
        this.y = p_y;
        this.z = p_z;
        this.w = p_w;
    }
}
    

class VertexClass
{
    constructor(p_position, p_colour, p_normal, p_textureCoordinates = null)
    {
        //alert(p_position.constructor.name);
        this.position = new Array(4);
        this.colour = new Array(4);
        this.normal = new Array(4);
        this.textureCoordinates = new Array(2);

        this.position[0] = p_position.x;
        this.position[1] = p_position.y;
        this.position[2] = p_position.z;
        
        if (p_position.hasOwnProperty("w")) this.position[3] = p_position.w;
        else this.position[3] = 1.0;
        
        this.colour[0] = p_colour.x;
        this.colour[1] = p_colour.y;
        this.colour[2] = p_colour.z;

        if (p_colour.hasOwnProperty("w")) this.colour[3] = p_colour.w;
        else this.colour[3] = 1.0;
        
        this.normal[0] = p_normal.x;
        this.normal[1] = p_normal.y;
        this.normal[2] = p_normal.z;
        this.normal[3] = 1.0;

        if (p_normal.hasOwnProperty("w")) this.normal[3] = p_normal.w;
        else this.normal[3] = 1.0;

        this.textureCoordinates[0] = 0.0;
        this.textureCoordinates[1] = 0.0;

        if (p_textureCoordinates != null)
        {
            this.textureCoordinates[0] = p_textureCoordinates.u;
            this.textureCoordinates[1] = p_textureCoordinates.v;
        }
    }
    
    MultiplyBy(p_matrix)
    {
        var temp = new Array(4);
        
        for (var pos = 0; pos < 4; pos++)
        {
            temp[pos] = 0.0;
            
            for (var i = 0; i < 4; i++) temp[pos] += (this.position[i] * p_matrix.Get(pos, i));
        }
        
        for (var pos = 0; pos < 4; pos++) this.position[pos] = temp[pos];
        
        for (var pos = 0; pos < 3; pos ++)
        {
            temp[pos] = 0.0;
            
            for (var i = 0; i < 3; i++) temp[pos] += (this.normal[i] * p_matrix.Get(pos, i));
        }    
        
        for (var pos = 0; pos < 3; pos++) this.normal[pos] = temp[pos];
    }
    
    CopyFrom(p_vertex)
    {
        for (var i = 0; i < 4; i++)
        {
            this.position[i] = p_vertex.position[i];
            this.colour[i] = p_vertex.colour[i];
            this.normal[i] = p_vertex.normal[i];
        }
    }

    ShowInfo()
    {
        var z = "";

        z += "Position = [ " + this.position[0] + ", " + this.position[1] + ", " + this.position[2] + ", " + this.position[3] + " ]";
        z += " Colour = [ " + this.colour[0] + ", " + this.colour[1] + ", " + this.colour[2] + ", " + this.colour[3] + " ]";
        z += " Normal = [ " + this.normal[0] + ", " + this.normal[1] + ", " + this.normal[2] + ", " + this.normal[3] + " ]";

        return z;
    }

    SetUV(p_u, p_v)
    {
        this.textureCoordinates[0] = p_u;
        this.textureCoordinates[1] = p_v;
    }
}
    

function myProgram_OnDraw()
{
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgram.modelMatrix, false, chart.myOpenGLRef.modelMatrix.m);
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgram.viewMatrix, false, chart.myOpenGLRef.viewMatrix.m);
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgram.projectionMatrix, false, chart.myOpenGLRef.projectionMatrix.m);
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgram.bypassMatrix, false, chart.myOpenGLRef.bypassMatrix.m);
    chart.myOpenGLRef.gl.uniform1f(chart.myOpenGLRef.myProgram.ambientLightLevelUniformLocation, chart.myOpenGLRef.myAmbientLightLevel);
    chart.myOpenGLRef.gl.uniform3fv(chart.myOpenGLRef.myProgram.diffuseLightPositionUniformLocation, chart.myOpenGLRef.myDiffuseLightPosition);
    chart.myOpenGLRef.gl.uniform3fv(chart.myOpenGLRef.myProgram.cameraPositionUniformLocation, chart.myOpenGLRef.myCameraPosition);
    chart.myOpenGLRef.gl.uniform1i(chart.myOpenGLRef.myProgram.useLightingUniformLocation, true);
    chart.myOpenGLRef.gl.uniform1i(chart.myOpenGLRef.myProgram.bypassMatrixesUniformLocation, false);
}

function myProgramNoLighting_OnDraw()
{
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgramNoLighting.modelMatrix, false, chart.myOpenGLRef.modelMatrix.m);
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgramNoLighting.viewMatrix, false, chart.myOpenGLRef.viewMatrix.m);
    chart.myOpenGLRef.gl.uniformMatrix4fv(chart.myOpenGLRef.myProgramNoLighting.projectionMatrix, false, chart.myOpenGLRef.projectionMatrix.m);
}



var myShaderDictionary = {};

myShaderDictionary["fragmentShader"] = {type: "x-shader/x-fragment",  text: "#version 300 es\nprecision mediump float;\n\nuniform float ambientLightLevel;\nuniform vec3 diffuseLightPosition;\nuniform vec3 cameraPosition;\nuniform bool useLighting;\n\nin vec3 ex_Colour;\nin vec3 fragPos;\nin vec3 ex_Normal;\nout vec4 out_Colour;\n\nvoid main(void)\n{\n    if (useLighting)\n    {\n        vec3 myColour = ex_Colour;\n        vec3 lightColour = vec3(1, 1, 1);\n        vec3 norm = normalize(ex_Normal);\n        float specularStrength = 0.5;\n        vec3 lightVector = normalize(diffuseLightPosition - fragPos);\n        vec3 viewDir = normalize(cameraPosition - fragPos);\n        vec3 reflectDir = reflect(-lightVector, norm);\n        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n        vec3 specular = specularStrength * spec * lightColour;\n\n        float diff = max(dot(norm, lightVector), 0.0);\n        vec3 diffuse = diff * lightColour;\n        vec3 result = (ambientLightLevel + diffuse + specular) * myColour;\n        out_Colour = vec4(result, 1);\n    }\n    else out_Colour = vec4(ex_Colour, 1);\n}\n"};

myShaderDictionary["fragmentShaderNoLighting"] = {type: "x-shader/x-fragment",  text: "#version 300 es\nprecision mediump float;\n\nin vec3 ex_Colour;\nout vec4 out_Colour;\n\nvoid main(void)\n{\n	out_Colour = vec4(ex_Colour, 1);\n}\n"};

myShaderDictionary["vertexShader"] = {type: "x-shader/x-vertex",  text: "#version 300 es\nprecision mediump float;\n\nin vec3 aVertexPosition;\nin vec3 uModelColour;\nin vec3 aNormal;\nout vec3 ex_Colour;\nout vec3 fragPos;\nout vec3 ex_Normal;\n\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\n\nvoid main(void)\n{\n    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);\n    fragPos = vec3(modelMatrix * vec4(aVertexPosition, 1.0));\n    ex_Colour = uModelColour;\n    ex_Normal = vec3(modelMatrix * vec4(aNormal, 0.0));\n}\n"};

myShaderDictionary["vertexShaderNoLighting"] = {type: "x-shader/x-vertex",  text: "#version 300 es\nprecision mediump float;\n\nin vec3 aVertexPosition;\nin vec3 uModelColour;\nout vec3 ex_Colour;\n\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\n\nvoid main(void)\n{\n    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);\n    ex_Colour = uModelColour;\n}\n"};

myShaderDictionary["vertexShaderTextures"] = {type: "x-shader/x-vertex",  text: "#version 300 es\nprecision mediump float;\n\nlayout(location=0) in vec3 aVertexPosition;\nlayout(location=1) in vec3 uModelColour;\nlayout(location=2) in vec3 aNormal;\nlayout(location=3) in vec2 aTexCoord;\n\nout vec3 ex_Colour;\nout vec3 fragPos;\nout vec3 ex_Normal;\nout vec2 TexCoord;\n\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 bypassMatrix;\nuniform bool bypassMatrixes;\n\nvoid main(void)\n{\n	if (bypassMatrixes) gl_Position = bypassMatrix * modelMatrix * vec4(aVertexPosition, 1.0);\n    else gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);\n    \n    fragPos = vec3(modelMatrix * vec4(aVertexPosition, 1.0));\n	ex_Colour = uModelColour;\n    ex_Normal = vec3(modelMatrix * vec4(aNormal, 0.0));\n    TexCoord = aTexCoord;\n}\n"};

myShaderDictionary["fragmentShaderTextures"] = {type: "x-shader/x-fragment",  text: "#version 300 es\nprecision mediump float;\n\nuniform float ambientLightLevel;\nuniform vec3 diffuseLightPosition;\nuniform vec3 cameraPosition;\nuniform bool useLighting;\nuniform bool useTextures;\nuniform sampler2D uSampler;\nuniform bool invertTexture;\nuniform vec3 textureBackgroundColour;\n\nin vec3 ex_Colour;\nin vec3 fragPos;\nin vec3 ex_Normal;\nin vec2 TexCoord;\nout vec4 out_Colour;\n\nvoid main(void)\n{\n    vec3 myColour = ex_Colour;\n\n    if (useTextures) myColour = vec3(vec4(ex_Colour, 1) * texture(uSampler, TexCoord));\n\n    if (useLighting)\n    {\n        vec3 lightColour = vec3(1, 1, 1);\n        vec3 norm = normalize(ex_Normal);\n        float specularStrength = 0.5;\n        vec3 lightVector = normalize(diffuseLightPosition - fragPos);\n        vec3 viewDir = normalize(cameraPosition - fragPos);\n        vec3 reflectDir = reflect(-lightVector, norm);\n        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n        vec3 specular = specularStrength * spec * lightColour;\n\n        float diff = max(dot(norm, lightVector), 0.0);\n        vec3 diffuse = diff * lightColour;\n        vec3 result = (ambientLightLevel + diffuse + specular) * myColour;\n        out_Colour = vec4(result, 1.0);\n    }\n    else\n    {\n        vec4 backgroundColour = vec4(textureBackgroundColour, 1);\n\n        //if (useTextures) out_Colour = vec4(ex_Colour, 1) * texture(uSampler, TexCoord);\n        //if (useTextures) out_Colour = foreColour + (texture(uSampler, TexCoord) * (grey - foreColour));\n        if (useTextures)\n        {\n            vec4 textureColour = texture(uSampler, TexCoord);\n    \n            if (invertTexture) textureColour = vec4(1, 1, 1, 2) - textureColour;\n\n            out_Colour = backgroundColour + (textureColour * (vec4(ex_Colour, 1) - backgroundColour));\n        }\n        else out_Colour = vec4(ex_Colour, 1);\n    }\n}\n"};
