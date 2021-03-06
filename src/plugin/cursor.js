/**
 * @typedef {Object} CursorPluginParams
 * @property {?boolean} deferInit Set to true to stop auto init in `addPlugin()`
 * @property {boolean} hideOnBlur=true Hide the cursor when the mouse leaves the
 * waveform
 * @property {string} width='1px' The width of the cursor
 * @property {string} color='black' The color of the cursor
 * @property {string} opacity='0.25' The opacity of the cursor
 * @property {string} style='solid' The border style of the cursor
 * @property {number} zIndex=3 The z-index of the cursor element
 * @property {object} customStyle An object with custom styles which are applied
 * to the cursor element
 */

/**
 * Displays a thin line at the position of the cursor on the waveform.
 *
 * @implements {PluginClass}
 * @extends {Observer}
 * @example
 * // es6
 * import CursorPlugin from 'wavesurfer.cursor.js';
 *
 * // commonjs
 * var CursorPlugin = require('wavesurfer.cursor.js');
 *
 * // if you are using <script> tags
 * var CursorPlugin = window.WaveSurfer.cursor;
 *
 * // ... initialising wavesurfer with the plugin
 * var wavesurfer = WaveSurfer.create({
 *   // wavesurfer options ...
 *   plugins: [
 *     CursorPlugin.create({
 *       // plugin options ...
 *     })
 *   ]
 * });
 */
export default class CursorPlugin {
    /**
     * Cursor plugin definition factory
     *
     * This function must be used to create a plugin definition which can be
     * used by wavesurfer to correctly instantiate the plugin.
     *
     * @param  {CursorPluginParams} params parameters use to initialise the
     * plugin
     * @return {PluginDefinition} an object representing the plugin
     */
    static create(params) {
        //params.lr 前后静音　单位秒
        return {
            name       : 'cursor',
            deferInit  : params && params.deferInit ? params.deferInit : false,
            params     : params,
            staticProps: {
                enableCursor() {
                    console.warn('Deprecated enableCursor!');
                    this.initPlugins('cursor');
                }
            },
            instance   : CursorPlugin
        };
    }
    
    /**
     * @type {CursorPluginParams}
     */
    defaultParams = {
        hideOnBlur : true,
        width      : '1px',
        color      : 'black',
        opacity    : '0.25',
        style      : 'solid',
        zIndex     : 4,
        customStyle: {}
    };
    
    /** @private */
    _onMousemove  = e => {
        if (!this._hasShow) {
            this.showCursor();
        }
        const bbox = this.wavesurfer.container.getBoundingClientRect();
        this.updateCursorPosition(e.clientX - bbox.left);
        const time             = this.wavesurfer.drawer.handleEvent(e) * this.wavesurfer.getDuration();
        this.title.textContent = `${Math.floor((time % 3600) / 60)}:${Math.floor(time % 60)}`;
    };
    /** @private */
    _onMouseenter = () => this.showCursor();
    /** @private */
    _onMouseleave = () => this.hideCursor();
    
    _onReady = () => {
        this._hasReady = true;
        if (this.params.lr) {
            const duration = this.wavesurfer.getDuration();
            if (duration > this.params.lr * 2) {
                const { width } = this.wavesurfer.container.getBoundingClientRect();
                const position  = (this.params.lr / duration) * width;
                if (this.wavesurfer.cursor_lr) {
                    this.style(this.cursorLeft, {
                        left: `${position}px`
                    });
                    this.style(this.cursorRight, {
                        right: `${position}px`
                    });
                } else {
                    this.drawLR(position + 'px', position + 'px');
                }
                this.wavesurfer.cursor_lr = true;
            }
        }
    };
    
    drawLR(left, right) {
        const wrapper              = this.wavesurfer.container;
        this.cursorLeft            = wrapper.appendChild(
            this.style(
                document.createElement('cursor'),
                this.wavesurfer.util.extend(
                    {
                        position        : 'absolute',
                        zIndex          : this.params.zIndex,
                        left,
                        top             : 0,
                        bottom          : 0,
                        width           : '0',
                        // display: 'none',
                        borderRightStyle: this.params.style,
                        borderRightWidth: this.params.width,
                        borderRightColor: this.params.color,
                        opacity         : this.params.opacity,
                        pointerEvents   : 'none'
                    },
                    this.params.customStyle
                )
            )
        );
        this.cursorLeft.className  = 'cursor c-l';
        this.cursorRight           = wrapper.appendChild(
            this.style(
                document.createElement('cursor'),
                this.wavesurfer.util.extend(
                    {
                        position        : 'absolute',
                        zIndex          : this.params.zIndex,
                        right,
                        top             : 0,
                        bottom          : 0,
                        width           : '0',
                        // display: 'none',
                        borderRightStyle: this.params.style,
                        borderRightWidth: this.params.width,
                        borderRightColor: this.params.color,
                        opacity         : this.params.opacity,
                        pointerEvents   : 'none'
                    },
                    this.params.customStyle
                )
            )
        );
        this.cursorRight.className = 'cursor c-r';
        
    }
    
    /**
     * Construct the plugin class. You probably want to use CursorPlugin.create
     * instead.
     *
     * @param {CursorPluginParams} params
     * @param {object} ws
     */
    constructor(params, ws) {
        /** @private */
        this.wavesurfer = ws;
        /** @private */
        this.style = ws.util.style;
        /**
         * The cursor html element
         *
         * @type {?HTMLElement}
         */
        this.cursor = null;
        this.title = null;
        /** @private */
        this.params = ws.util.extend({}, this.defaultParams, params);
        this._hasReady = false;
        this._hasShow  = false;
        this.wavesurfer.on('ready', this._onReady);
    }
    
    /**
     * Initialise the plugin (used by the Plugin API)
     */
    init() {
        if (this.wavesurfer.isReady) {
            this._onReady();
        }
        window.wavesurfer     = this.wavesurfer;
        this.wrapper          = this.wavesurfer.container;
        this.cursor           = this.wrapper.appendChild(
            this.style(
                document.createElement('cursor'),
                this.wavesurfer.util.extend(
                    {
                        position        : 'absolute',
                        zIndex          : this.params.zIndex,
                        left            : 0,
                        top             : 0,
                        bottom          : 0,
                        width           : '0',
                        display         : 'none',
                        borderRightStyle: this.params.style,
                        borderRightWidth: this.params.width,
                        borderRightColor: this.params.color,
                        opacity         : this.params.opacity,
                        pointerEvents   : 'none'
                    },
                    this.params.customStyle
                )
            )
        );
        this.cursor.className = 'cursor';
        this.title            = this.style(document.createElement('span'), {
            position: 'relative',
            top     : '-3px',
            left    : '2px'
        });
        this.cursor.appendChild(this.title);
        
        this.wrapper.addEventListener('mousemove', this._onMousemove);
        if (this.params.hideOnBlur) {
            this.wrapper.addEventListener('mouseenter', this._onMouseenter);
            this.wrapper.addEventListener('mouseleave', this._onMouseleave);
        }
    }
    
    /**
     * Destroy the plugin (used by the Plugin API)
     */
    destroy() {
        this.cursor.parentNode.removeChild(this.cursor);
        this.wrapper.removeEventListener('mousemove', this._onMousemove);
        if (this.params.hideOnBlur) {
            this.wrapper.removeEventListener('mouseenter', this._onMouseenter);
            this.wrapper.removeEventListener('mouseleave', this._onMouseleave);
        }
        this.wavesurfer.removeEventListener('ready', this._onReady());
    }
    
    /**
     * Update the cursor position
     *
     * @param {number} pos The x offset of the cursor in pixels
     */
    updateCursorPosition(pos) {
        this.style(this.cursor, {
            left: `${pos}px`
        });
    }
    
    /**
     * Show the cursor
     */
    showCursor() {
        if (this._hasReady) {
            this._hasShow = true;
            this.style(this.cursor, {
                display: 'block'
            });
        }
    }
    
    /**
     * Hide the cursor
     */
    hideCursor() {
        this._hasShow = false;
        this.style(this.cursor, {
            display: 'none'
        });
    }
}
