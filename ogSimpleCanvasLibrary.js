/**
 * @file SimpleCanvas
 * @module SimpleCanvas
 * @author Thomas Hinkle
 * 
 * @overview A simple library for handling basic canvas drawings,
 * callbacks and animations. 
 * @desc Created as a teaching library to give students a
 * close-to-the-browser-API experience in game development. This
 * library mainly makes it easy to handle things like animations and
 * resizing without having to get into the weeds too quickly. To use,
 * simply include this file in your HTML, or you can link to it by
 * pasting the following tag into your HTML before you run your own
 * code:
 * @example
 * <html>
 *    <canvas id="game">
 *    <script src="http://www.tomhinkle.net/util/SimpleCanvasLibrary.js"></script>
 *    <script>
 *        const game = new GameCanvas('game')
 *        game.addDrawing(
 *           function ({ctx, elapsed, width, height}) {
 *               let x = (100 * elapsed/1000) % width;
 *               let y = height/2
 *               ctx.beginPath();
 *               ctx.arc(x,y,20,0,Math.PI*2);
 *               ctx.stroke();
 *           }
 *        );
 *        game.run();
 *    </script>
 * </html>
 *
 *
 *
 */


/**
 * GameCanvas sets up a canvas for creating a simple
 * game in. 
 * 
 * Hand it the id of the canvas you want to use from your
 * HTML document.
 * 
 * It returns an object for registering functions to do 
 * the drawing and for registering callbacks to handlers
 * events on the canvas.
 * @constructor GameCanvas
 * @param {string|Canvas} canvas - The Canvas Element OR the ID of the canvas element we will render the game in.
 * @param {Object} config - Optional argument with initial size of canvas in pixels (otherwise we just measure the element)
 * @param {Size} config.size=undefined - Optional size for canvas. Otherwise size is taken from explicitly set width/height OR from the element's size on the page.
 * @param {boolean} config.autoresize=false - autoresize=true whether to resize the game canvas to the DOM canvas automatically (defaults to true)
 * @memberof SimpleCanvas
 *
 * @example  <caption>Make a simple spinner using only the addDrawing method.</caption>
 * game = GameCanvas('game'); // Set up a game on <canvas id='game'>
 * game.addDrawing(
 *    function ({ctx,elapsed}) {
 *         ctx.beginPath();
 *         ctx.moveTo(100,100);
 *         ctx.lineTo(100+Math.cos(elapsed/1000)*100,
 *                    100+Math.sin(elapsed/1000)*100);
 *         ctx.stroke()
 *    }
 * );
 * game.run();
 * 
 *
 * @example <caption>Create a game where clicking makes balls drop.</caption>
game = GameCanvas('game');
const colors = ['red','green','purple','yellow','orange']
const drawings = []; // track our drawings so we can remove them...
var colorIndex = 0;
var color = colors[colorIndex]

game.addClickHandler(
    // When the canvas is clicked...
    function ({x,y}) {        
        // Add the drawing to the game...
        var id = game.addDrawing(
            function ({ctx,elapsed,height}) {
                var ypos = y + elapsed/5;
                while (ypos > height) {
                    ypos -= height; // come around the top...
                }
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(x,ypos,20,0,Math.PI*2);
                ctx.fill();
            } // end drawing function
        )

        drawings.push(id); // Keep track of our drawing so we can remove it.
        // If we have too many drawings, remove the first one we put on...
        if (drawings.length > colors.length) { 
            const toRemove = drawings.shift()
            game.removeDrawing(toRemove);
        }

        // shift colors for next ball
        colorIndex += 1;
        if (colorIndex >= colors.length) {colorIndex = 0}
        color = colors[colorIndex];

    } // end click callback

);
game.run(); // run the game!

**/

function GameCanvas (id='game',{size={},autoresize=false}={}) {

    // if user accidentally omits the new keyword, this will 
    // silently correct the problem...
    if ( !(this instanceof GameCanvas) ) {
        return new GameCanvas(id,{size,autoresize});
    }

    // constructor logic follows.
    if (!id) {
        throw new Error('GameCanvas must be called with the ID of a canvas, like this\n\nconst game=new GameCanvas("mycanvasid")');
    }

    const canvas = id instanceof HTMLElement && id || document.getElementById(id)
    if (!canvas) {
        throw new Error('No canvas element found at ID=',id);
    }

    var width,height;
            
    const ctx = canvas.getContext('2d');
    var start; // start time!
    const drawings = [];
    const drawingMetadata = [];
    const handlers = {
        resize : []
    };
    setInitialCanvasSize();    

    // Slightly complicated: basically, we want to ignore the browser's lame default canvas sizing, and we want to respect
    // whatever our users have done.
    //
    // So, we have three options, in order of priority:
    // size explicitly set - respect it
    // width/height attributes set on canvas - respect them
    // OR - take the width/height of the initial element
    function setInitialCanvasSize () {
        // Initial sizing explicitly
        if (size.width) {
            canvas.width = size.width;
            width = size.width;
        }
        else if (canvas.getAttribute('width')) {
            width = canvas.width
        }
        else {
            width = canvas.clientWidth;
            canvas.width = width;
        }
        if (size.height) {
            canvas.height = size.height;
            height = size.height;
        }
        else if (canvas.getAttribute('height')) {
            height = canvas.height
        }
        else {
            height = canvas.clientHeight;
            canvas.height = height;
        }
    }

    function observeCanvasResize () {
        const ro = new ResizeObserver(canvases => {
            // there will only be one entry...
            for (let cnv of canvases) {
                //entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';
                if (autoresize) {
                    setCanvasSize(cnv.contentRect.width,cnv.contentRect.height);
                }
                for (var h of handlers['resize']) {
                    /**
                     * @callback SimpleCanvas.GameCanvas~resizeCallback
                     * @param {Object} config
                     * @param {CanvasRenderingContext2D} config.ctx - drawing context
                     * @param {number} config.width - width of canvas element (will be same as internal width if autoresize is true)
                     * @param {number} config.height - height of canvas element (will be same as internal height if autoresize is true)
                     * @param {Canvas} canvas - the canvas DOM element
                     * @param {function} setCanvasSize - method to set internal size of canvas (width, height) if you want to implement custom sizing logic.
                     * @return true to prevent other handlers from being called, or false to allow other handlers to run.
                     **/
                    
                    let result = h({width:cnv.contentRect.width,
                                    height:cnv.contentRect.height,
                                    canvas,setCanvasSize,ctx});
                    if (result) {
                        return // exit early
                    }
                }
            }
        });
        // Only observe the second box
        ro.observe(canvas);
    }

    function setCanvasSize (w,h) {
        width = w;
        height = h;
        canvas.width = w;
        canvas.height = h;
    }
    
    
    function doDrawing (ts) {
        ctx.clearRect(0,0,width,height);
        /**
         * @callback SimpleCanvas.GameCanvas~drawCallback
         * @param {Object} config
         * @param {CanvasRenderingContext2D} config.ctx
         * @param {number} config.width - width of canvas
         * @param {number} config.height - height of canvas
         * @param {number} config.elapsed - milliseconds since first drawing
         * @param {number} config.timestamp - current timestamp
         * @param {number} config.stepTime - milliseconds passed since last tick
         * @param {number} config.remove - a function that will remove this callback from the queue
         **/
        drawings.forEach((d,idx)=>{
            function remove () {
                drawingMetadata[idx].off = true;
            }
            const md = drawingMetadata[idx];
            if (md.off) {return} // end!
            var elapsed;
            var stepTime = md.__lastTime && ts - md.__lastTime || 0;
            md.__lastTime = ts;
            if (!md.__startTime) {
                elapsed = 0;
                md.__startTime = ts;
            }
            else {
                elapsed = ts - md.__startTime;
            }
            if (d.draw) {
                d.draw({ctx,width,height,remove,timestamp:ts,elapsed,stepTime})
            }
            else {
                d({ctx,width,height,remove,timestamp:ts,elapsed,stepTime})
            }
        });
    }

    function tick (ts) {
        doDrawing(ts);
        window.requestAnimationFrame(tick);
    }

    var mousedown = false;

    function setupHandler (canvas,eventType) {
        handlers[eventType] = [];
        canvas.tabIndex = 1000;

        canvas.addEventListener(eventType, function (evt) {          
            const x = evt.offsetX;
            const y = evt.offsetY;
            for (var h of handlers[eventType]) {
                /**
                 * @callback SimpleCanvas.GameCanvas~eventCallback
                 * @param {Object} config 
                 * @param {number} config.x - offsetX of event (x with respect to canvas)
                 * @param {number} config.y - offsetY of event (y with respect to canvas)
                 * @param {string} config.type - type of event (i.e. mouseUp)
                 * @param {Object} config.event - javascript event object
                 * @return true to prevent other handlers from being
                 * called, or return undefined/false to allow other
                 * handlers to run.
                 */
                var result = h({x,y,type:eventType, event:evt})
                if (result) {
                    // exit early!
                    return;
                }
            }
        });
    }
    
    setupHandler(canvas,'click');
    setupHandler(canvas,'dblclick');
    setupHandler(canvas,'mousedown');
    setupHandler(canvas,'mousemove');
    setupHandler(canvas,'mouseup');
    setupHandler(canvas,'keyup');
    setupHandler(canvas,'keydown');
    setupHandler(canvas,'keypress');

    /**
     * run the game (start animations, listen for events).
     * @member SimpleCanvas.GameCanvas#run
     * @method
     */
    this.run = function () {
        observeCanvasResize();
        if (autoresize) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        tick ();
    },


    /** 
     * @member SimpleCanvas.GameCanvas#addDrawing
     * @method
     * @param {SimpleCanvas.GameCanvas~drawCallback} draw function OR an object with a draw callback method
     * @desc Add a drawing to our drawing queue (it will remain until we remove it).
     * @return ID that can be used in a {@link SimpleCanvas.GameCanvas#removeDrawing} callback to remove drawing.
     * @example <caption>Passing a draw function</caption> 
     * 
     * game.addDrawing(
     *     function ({ctx,elapsed}) {
     *         ctx.beginPath();
     *         ctx.moveTo(200,200);
     *         ctx.lineTo(100,200+Math.sin(elapsed/10)*200);
     *         ctx.stroke();
     *     }
     * );
     *
     * @example <caption>Passing an object with a draw method</caption>
     * game.addDrawing(
     *      { x : 0,
     *        y : 0,
     *        w : 100,
     *        h : 100,
     *        draw ({ctx,stepTime,width,height}) {
     *           this.x += stepTime/20;
     *           this.y += stepTime/20;
     *           if (this.x > width) { this.x = 0 }
     *           if (this.y > height) { this.y = 0 }
     *           ctx.fillRect(this.x,this.y,this.w,this.h)
     *        },
     *      }
     *);
     *
     * @example <caption>A drawing that will remove itself when it leaves the screen</caption>
     * game.addDrawing(
     *     function ({ctx,elapsed,width,remove}) {
     *         const x = elapsed / 20
     *         ctx.fillRect(20,20,20);
     *         if (x > width) { remove () }
     *     }
     * );
     *
     */
    this.addDrawing = function (d) {
        if (typeof d !== 'function') {
            if (typeof d === 'object') {
                if (typeof d.draw !== 'function') {
                    throw new Error(`addDrawing requires a function or an object with a draw method as an argument. Received Object ${d} instead; d.draw => ${d.draw}.`);
                }            
            }
            else {
                throw new Error(`addDrawing requires a function or an object with a draw method as an argument. Received ${d} (${typeof d}).`);
            }
        }
        drawings.push(d);
        drawingMetadata.push({});
        return drawings.length - 1;
    };
    /**
     * @member SimpleCanvas.GameCanvas#removeDrawing
     * @method
     * @param {number} id - drawing ID to remove (return value from {SimpleCanvas.GameCanvas#addDrawing}).
     */
    this.removeDrawing = function (idx) {
        if (typeof idx !== 'number') {
            throw new Error(`removeDrawing must have a numeric ID as an argument. Received ${typeof idx} ${idx}`);
        }
        if (drawingMetadata[idx]) {
            drawingMetadata[idx].off = true;
        }
        else {
            console.log('WARNING: Attempt to remove non-existent drawing: %s',idx);
        }
    };


    /**
     * @member SimpleCanvas.GameCanvas#restoreDrawing
     * @method
     * @param {number} id - drawing ID to restore (start drawing again).
     */
    this.restoreDrawing = function (idx) {
        if (typeof idx !== 'number') {
            throw new Error(`restoreDrawing must have a numeric ID as an argument. Received ${typeof idx} ${idx}`);
        }
        drawingMetadata[idx].off = false;
    }
    
    /**
     * @member SimpleCanvas.GameCanvas#replaceDrawing
     * @method
     * @param {number} id - drawing ID to replace
     * @param {SimpleCanvas.GameCanvas~drawCallback} f - draw function OR an object with a draw callback method
     **/
    this.replaceDrawing = function (idx, f) {
        if (typeof idx !== 'number') {
            throw new Error(`replaceDrawing must have a numeric ID as an argument. Received ${typeof idx} ${idx}`);
        }
        drawings[idx] = f;
        return idx;
    }

    /**
     * @member SimpleCanvas.GameCanvas#addHandler
     * @method
     * @desc Register a handler h for eventType
     * Returns an ID that can be used to later remove 
     * the handler.
     * @param {string} eventType - the javaScript event to handle. Can be click,dblclick,mousedown,mousemove,mouseup or keyup
     * @param {SimpleCanvas.GameCanvas~eventCallback} eventCallback - A callback to handle events of type eventType.
     * @return ID that can be used to remove handler with {@link SimpleCanvas.GameCanvas#removeHandler}
     */
    this.addHandler = function (eventType,h) {
        if (!handlers[eventType]) {
            throw new Error(`No eventType ${eventType}: SimpleCanvasLibrary only supports events of type: ${Object.keys(handlers).join(',')}`);
        }
        if (typeof h !== 'function') {
            throw new Error(`addHandler requires a function as second argument. ${h} is a ${typeof h}, not a function.`);
        }
        handlers[eventType].push(h);
        return handlers[eventType].length - 1;
    }
    /** 

     * @member SimpleCanvas.GameCanvas#removeHandler
     * @method
     * @desc Remove handler for eventType.
     * @param {String} eventType - the javaScript event to handle 
     * @param {Number} id - the ID of the handler to remove (this is the value returned by {@link SimpleCanvas.GameCanvas#addHandler})
     */
    this.removeHandler = function (eventType,idx) {
        if (!handlers[eventType]) {
            throw new Error(`No eventType ${eventType}: SimpleCanvasLibrary only supports events of type: ${Object.keys(handlers).join(',')}`);;
        }
        handlers[eventType][idx] = ()=>{};
    };
    /**
     * @member SimpleCanvas.GameCanvas#addClickHandler
     * @method
     * @desc Syntactic sugar for {@link SimpleCanvas.GameCanvas#addHandler|addHandler}('click',h)
     */
    this.addClickHandler = function (h) {
        if (typeof h !== 'function') {
            throw new Error(`addClickHandler requires a function as an argument. ${h} is a ${typeof h}, not a function.`);
        }
        handlers.click.push(h);
        return handlers.click.length - 1;
    };
    /**
     * @member SimpleCanvas.GameCanvas#removeClickHandler
     * @method
     * Syntactic sugar for {@link SimpleCanvas.GameCanvas#removeHandler|removeHandler}('click',h)
     * 
     * @example <caption>Make a drawing move whenever there is a click</caption>
     *
     * var xpos = 100;
     * var ypos = 100;
     * // Register a handler to update our variable each time
     * // there is a click.
     * game.addClickHandler(
     *     function ({x,y}) {
     *       // set variables...
     *       xpos = x;
     *       ypos = y;
     *     }
     * )
     * // Now create a drawing that uses the variable we set.
     * game.addDrawing(
     *     function ({ctx}) {ctx.fillRect(xpos,ypos,30,30)}
     * )
     */
    this.removeClickHandler = function (idx) {
        handlers.click[idx] = ()=>{}
    };


    /**
     * @member SimpleCanvas.GameCanvas#addResizeHandler
     * @method
     * @desc Register a handler h for resize
     * Returns an ID that can be used to later remove 
     * the handler.
     * @param {string} eventType - the javaScript event to handle. Can be click,dblclick,mousedown,mousemove,mouseup or keyup
     * @param {SimpleCanvas.GameCanvas~resizeCallback} resizeCallback - A callback to handle canvas resize events
     * @return ID that can be used to remove handler with {@link SimpleCanvas.GameCanvas#removeResizeHandler}
     */
    /*
     * @example <caption>Use resize handler to see if we are in portrait or landscape orientation</caption>
     * let portraitMode = false;
     * game.addResizeHandler(
     *   function ({width,height}) {
     *     if (height > width) {
     *        portraitMode = true;
     *     }
     *   }
     * );
     */   

    this.addResizeHandler = function (h) {
        return this.addHandler('resize',h)
    }

    /**
     * @member SimpleCanvas.GameCanvas#removeResizeHandler
     * @method
     * Syntactic sugar for {@link SimpleCanvas.GameCanvas#removeHandler|removeHandler}('resize',h)
     * 
    this.removeResizeHandler = function (idx) {
        return this.removeHandler('resize',h)
    }

    /**
     * @member SimpleCanvas.GameCanvas#getSize
     * @method
     * @return {Size} size
     */

    this.getSize = function () {
        return {width, height}
    }

}

function testLibrary () {
    const c = document.createElement('canvas');
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(c);
    c.setAttribute('id','testCanvas');
    c.setAttribute('width',800);
    c.setAttribute('height',800);
    const g = GameCanvas('testCanvas');
    const id = g.addDrawing(({ctx})=>{ctx.fillRect(20,20,200,200)});
    const id2 = g.addDrawing(({ctx})=>{ctx.fillRect(200,200,20,20)});
    var tog = true;
    g.addClickHandler(
        ({x,y})=>{
            if (tog) {
                g.removeDrawing(id2);
            }
            else {
                g.restoreDrawing(id2);
            }
            tog = !tog;
            g.replaceDrawing(
                id,
                ({ctx,elapsed})=>{ctx.strokeRect(x,y,elapsed/500,elapsed/500)}
            )
        }
    );
    g.run();
}

/**
* Sprite sets up a constructor for a simple game sprite.
*
* You can draw your own spritesheet using a tool like https://www.piskelapp.com/
*
* @constructor Sprite
* @memberof SimpleCanvas
* @param {Object} config
* @param {string} config.src - URL of SpriteSheet resource.
* @param {number} config.x - Position of Sprite on the canvas
* @param {number} config.y - Position of Sprite on the canvas
* @param {number} config.frameWidth - width of each frame of the sprite sheet (defaults to width of image)
* @param {number} config.frameHeight - height of each frame of the sprite sheet (defaults to height of image)
* @param {number} config.frame - frame to start on (default to 0).
* @param {Array} config.frameSequence - list of frame indices to run (if not specified, we run all frames in order).
* @param {number} config.targetWidth - width of sprite to draw on canvas (same as source image if not specified)
* @param {number} config.targetHeight - height of sprite to draw on canvas (same as source image if not specified)
* @param {boolean} config.animate - whether to animate or not.
* @param {number} config.frameRate - Number of frames per second to run animation at.
* @param {number} config.repeat - Whether to repeat the animation or play only once (true by default)
* @param {number} config.angle - Angle to rotate drawing (in radians)
* @param {SimpleCanvas.Sprite~updateCallback} config.update - a callback to run on each animation frame just before drawing sprite to canvas.
*
**/
/** @typedef SimpleCanvas.Sprite~Sprite
* @property {Array} frameSequence - list of frame indices to run (if not specified, we run all frames in order).
* @property {boolean} animate - whether to run animation or not.
* @property {number} frameRate - frames per second to play animation at.
* @property {number} frameAnimationIndex - current frame (relative to frameSequence). Set to 0 to restart animation
**/
function Sprite (  {src,
                    x = 0,
                    y = 0,
                    frame = 0,
                    animate = true,
                    frameSequence,
                    frameWidth,
                    frameHeight,
                    angle,
                    targetWidth,
                    targetHeight,
                    frameRate = 24,
                    repeat = true,
                    update}) {

    if ( !(this instanceof Sprite) ) {
        return new Sprite(id);
    }
    if (!frameWidth) {
        throw new Error(
            'Sprite not provided required parameter frameWidth'
        );
    }
    if (!frameHeight) {
        throw new Error(
            'Sprite not provided required parameter frameWidth'
        );
    }
    if (!src) {
        throw new Error(
            'Sprite not provided with src or preloaded image: needs parameter src or image'
        );
    }
    // set up image
    this.image = new Image();
    this.ready = false;
    this.image.onload = ()=>{
        this.ready=true;
        if (!this.frames) {
            this.frames = this.framesAcross * this.framesDown;
        }
    }
    this.image.src = src;
    this.animate = animate;
    this.frameWidth = frameWidth;
    /**
     * Create a copy of sprite.
     * @method SimpleCanvas.Sprite#copy
     * @param {Object} newParams - settings to override (all other settings will be copied from current sprite)
     * Return a copy of sprite.
     **/
    this.copy = function (newParams) {
        const params = {...this,...newParams,src:src}
        return new Sprite(params);
    }
    /** 
     * draw sprite to canvas
     * @property SimpleCanvas.Sprite#frameHeight
     */
    this.frameHeight = frameHeight;
    /** 
     * draw sprite to canvas
     * @property SimpleCanvas.Sprite#frameWidth
     */
    this.frameRate = frameRate;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.frameAnimationIndex = frame;
    this.frameSequence = frameSequence;
    this.targetWidth = targetWidth || frameWidth;
    this.targetHeight = targetHeight || frameHeight;
    this.update = update;
    this.repeat = repeat;
    
    Object.defineProperties(
        this,
        {framesAcross : {
            get : () => this.image.width/this.frameWidth
        },
         framesDown : {
             get : () => this.image.height / this.frameHeight
         },
         frame : {
             get : () => {
                 if (this.repeat) {
                     if (this.frameSequence) {
                         const sequenceIndex = this.frameAnimationIndex % this.frameSequence.length;
                         return this.frameSequence[Math.floor(sequenceIndex)]
                     }
                     else {
                         return this.frameAnimationIndex % this.frames;
                     }
                 }
                 else {
                     if (this.frameSequence) {
                         return this.frameSequence[Math.min(Math.floor(this.frameAnimationIndex),this.frameSequence.length - 1 )];
                     }
                     else {
                         return Math.min(Math.floor(this.frameAnimationIndex),this.frames - 1);
                     }
                 }
             }
         },
         rowNum : {
             get : () => Math.floor(Math.floor(this.frame) / this.framesAcross)
         },
         colNum : {
             get : () => Math.floor(this.frame) % this.framesAcross
         },
         frameX : {
             get : () => this.colNum * this.frameWidth
         },
         frameY : {
             get : () => this.rowNum * this.frameHeight
         },
         remove : () => this.removeOnNextFrame = true
        }
    );


    /** 
     * draw sprite to canvas
     * @member SimpleCanvas.Sprite#draw
     * @method
     */
    this.draw = (cfg) => {
        // if (!this.ready) {
        //     ctx.fillText(
        //         'Loading...',
        //         this.x,this.y
        //     );
        // }
        const {ctx, elapsed, stepTime, remove} = cfg;
        if (this.removeOnNextFrame) {
            remove();
        }
        if (!this.ready) {
            ctx.fillText(
                'Loading image...',
                this.x,this.y
            );
        }
        else {
            if (this.update) {
                /**
                 * @callback SimpleCanvas.Sprite~updateCallback
                 * @desc This callback runs just before sprite is drawn to canvas.
                 * @param {Object} config
                 * @param {Object} config.sprite - sprite object being updated
                 * @param {number} config.width - width of canvas
                 * @param {number} config.height - height of canvas
                 * @param {number} config.elapsed - milliseconds since first drawing
                 * @param {number} config.timestamp - current timestamp
                 * @param {number} config.stepTime - milliseconds passed since last tick
                 * @param {number} config.remove - a function that will remove this callback from the queue
                 **/
                this.update({
                    sprite:this,
                    ...cfg
                });
            }
            if (this.angle) {
                ctx.translate(this.x+this.targetWidth/2,this.y+this.targetHeight/2);
                ctx.rotate(this.angle);
                ctx.translate(-(this.x+this.targetWidth/2),-(this.y+this.targetHeight/2));
            }
            ctx.drawImage(
                this.image,
                this.frameX,
                this.frameY,
                this.frameWidth,
                this.frameHeight,
                this.x,
                this.y,
                this.targetWidth,
                this.targetHeight,
            );
            if (this.animate) {
                this.frameAnimationIndex += stepTime / (1000/this.frameRate);
            }
            ctx.setTransform(1,0,0,1,0,0); // reset

        }
    }
    

    return this;
}
/** @typedef {Object} Size
 * @global
 * @property {number} width - width in pixels
 * @property {number} height - height in pixels
 **/
