class Cropper {
    constructor(config) {
        this.selector = null;
        
        this.uploaderInput = null;
        if (config.selector) {
            this.selector = document.querySelector(config.selector);
            this.wrap(this.selector)
        }
        this.cropActionConfig = {
            image:null,
            minWidth:30,
            minHeight:30,
            maxWidth:null,
            maxHeight:null,
            margin:2,
            handeler:null,
            container:null,
            previewContainer:null,
            orginal: {
                height:0,
                width:0,
            },
            resize: {
                height:0,
                width:0,
            }
        }
        this.generateCropper();
    }
    wrap(toWrap) {
        let wrapper = document.createElement('div');
        wrapper.classList.add('cropper-wraper');
        toWrap.parentNode.appendChild(wrapper);
        return wrapper.appendChild(toWrap);
    }
    generateCropper() {
        if (this.selector) {
            this.selector.classList.add('cropper');
            const uploaderContainer = document.createElement('div');
            uploaderContainer.classList.add('uploader-content');


            this.uploaderInput = document.createElement('input');
            this.uploaderInput.setAttribute('type', 'file');
            this.uploaderInput.setAttribute('accept', 'image/*')
            this.uploaderInput.classList.add('uploader');
            this.uploaderInput.addEventListener('change', (event) => {
                if (event.target.files) {
                    let file = event.target.files[0];
                    var render = new FileReader();
                    this.toggleLoader(false);
                    render.onload = (e) => {
                        const uploaderPreviewContainer = document.createElement('div');
                        uploaderPreviewContainer.classList.add('uploader-preview-content');
                        uploaderPreviewContainer.style.backgroundImage = "url(" + e.target.result + ")";
                        let selectorWidth = this.selector.offsetWidth;
                        let selectorHeight = this.selector.offsetHeight;
                        this.cropActionConfig.image = e.target.result;
                        let img = new Image();
                        img.src = e.target.result;
                        let _this = this;
                        img.onload = function () {
                            _this.cropActionConfig.orginal.height = this.height;
                            _this.cropActionConfig.orginal.width = this.width;

                            let containerRatioHeight = parseInt((this.height / this.width) * selectorWidth);
                            if (containerRatioHeight > selectorHeight) {
                                containerRatioHeight = selectorHeight;
                            }
                            uploaderPreviewContainer.style.height = containerRatioHeight + 'px';

                            _this.getResizeImageSize(uploaderPreviewContainer, function (obj) {
                                uploaderPreviewContainer.style.width = obj.width + 'px';
                                _this.cropActionConfig['maxWidth'] = obj.width;
                                _this.cropActionConfig['maxHeight'] = obj.height;

                                _this.cropActionConfig.resize.height = obj.height;
                                _this.cropActionConfig.resize.width = obj.width;
                            })
                        }


                        let cropperActionContainerBox = document.createElement('div');
                        cropperActionContainerBox.classList.add('cropper-action-container');
                        let cropperAction = document.createElement('div');
                        cropperAction.classList.add('cropper-action');
                        cropperAction.setAttribute('draggable', true);
                        
                        this.cropActionConfig.handeler = cropperAction;
                        this.dragElement(cropperAction);

                        cropperActionContainerBox.appendChild(cropperAction);
                        uploaderPreviewContainer.appendChild(cropperActionContainerBox);
                        this.cropActionConfig.container = uploaderPreviewContainer;

                        this.selector.appendChild(uploaderPreviewContainer);

                        let buttonContainer = document.createElement('div');
                        buttonContainer.classList.add('button-container');
                        let resetButton = document.createElement('button');
                        resetButton.innerText = 'Reset';
                        resetButton.addEventListener('click', () => {
                            this.selector.removeChild(uploaderPreviewContainer);
                            this.selector.parentElement.removeChild(buttonContainer);
                        });
                        buttonContainer.appendChild(resetButton);

                        let uploadButton = document.createElement('button');
                        uploadButton.innerText = 'Save';
                        uploadButton.addEventListener('click', this.cutter.bind(this));
                        buttonContainer.appendChild(uploadButton);

                        let cropPreviewContainer = document.createElement('div');
                        cropPreviewContainer.classList.add('crop-preview');
                        this.cropActionConfig.previewContainer = cropPreviewContainer;
                        buttonContainer.appendChild(cropPreviewContainer);
                        this.selector.parentElement.appendChild(buttonContainer);
                        this.toggleLoader();
                    }
                    render.readAsDataURL(file);
                    // console.log(file);
                }
            });

            uploaderContainer.addEventListener('click', () => {
                this.uploaderInput.click();
            });
            uploaderContainer.appendChild(this.uploaderInput);
            this.selector.appendChild(uploaderContainer);

        }
    }

    cutter() {
        let cropWidth = (this.cropActionConfig.handeler.offsetWidth / this.cropActionConfig.resize.width)*this.cropActionConfig.orginal.width;

        let cropHeight = (this.cropActionConfig.handeler.offsetHeight / this.cropActionConfig.resize.height)*this.cropActionConfig.orginal.height;
        var childOffset = {
            top: this.cropActionConfig.handeler.offsetTop - this.cropActionConfig.handeler.parentElement.offsetTop,
            left: this.cropActionConfig.handeler.offsetLeft - this.cropActionConfig.handeler.parentElement.offsetLeft
        }

        let cropY = (childOffset.top / this.cropActionConfig.resize.width) *this.cropActionConfig.orginal.width; 

        let cropX = (childOffset.left / this.cropActionConfig.resize.width) *this.cropActionConfig.orginal.width;
        
        let theImage = this.cropActionConfig.image;
        var output = this.cropActionConfig.previewContainer;
        let c1 = document.createElement('canvas');
        var canvas = c1.getContext("2d");
        c1.width = cropWidth;
        c1.height = cropHeight;
        var img = new Image();
        img.src = theImage;
        img.onload = (function() {
            canvas.drawImage(img,cropX, cropY,cropWidth, cropHeight,0,0,cropWidth, cropHeight);
            output.innerHTML = "";
            output.appendChild(c1);
            this.cropActionConfig.handeler.style.backgroundImage = "url("+c1.toDataURL()+")";
        }).bind(this)
    }

    toggleLoader(hide = true) {
        if (hide == false) {
            let LoaderContainer = document.createElement('div');
            LoaderContainer.classList.add('loader-container');
            let Loader = document.createElement('div');
            Loader.classList.add('loader');
            LoaderContainer.appendChild(Loader);
            this.selector.appendChild(LoaderContainer);
        } else {
            this.selector.removeChild(this.selector.querySelector('.loader-container'));
        }
    }

    getResizeImageSize(selector, callback) {
        var img = new Image;
        let imgData = selector.style.backgroundImage.replace(/url\(|\)$/ig, "");
        imgData = imgData.replace('"', '');
        imgData = imgData.replace('"', '');
        img.src = imgData;
        var imgW = img.width;
        var imgH = img.height;

        var newW, newH;
        img.onload = function () {

            if (imgW > imgH) {
                newW = selector.offsetWidth; //100;
                newH = imgH / imgW * newW;
            } else {
                newH = selector.offsetHeight; //100
                newW = imgW / imgH * newH;
            }
            callback({
                width: newW,
                height: newH
            });
        }
    }

    dragElement(elmnt) {
        const _this = this;
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
            var calvalue = null;
            var calEdgeConfig = null;
        elmnt.onmousemove = function(e) {
            calvalue = _this.calc(e, elmnt);
            
            if (calvalue.rightedge && calvalue.bottomedge || calvalue.leftedge && calvalue.topedge) {
                elmnt.style.cursor = 'nwse-resize';
            } else if (calvalue.rightedge && calvalue.topedge || calvalue.bottomedge && calvalue.leftedge) {
                elmnt.style.cursor = 'nesw-resize';
            } else if (calvalue.rightedge || calvalue.leftedge) {
                elmnt.style.cursor = 'ew-resize';
            } else if (calvalue.bottomedge || calvalue.topedge) {
                elmnt.style.cursor = 'ns-resize';
            } else if (_this.canMove(calvalue)) {
                elmnt.style.cursor = 'move';
            } else {
                elmnt.style.cursor = 'default';
            }
            _this.cutter();
        }
    
        elmnt.onmousedown = function(e) {
            calEdgeConfig = _this.calc(e, elmnt);
            var isResizing = calEdgeConfig.rightedge || calEdgeConfig.bottomedge || calEdgeConfig.topedge || calEdgeConfig.leftedge;
            
            if (isResizing) { // resizing div
                resizeMouseDown(e);
            } else { // drag div
                dragMouseDown(e);
            }
        }
        

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            let finalTop = (elmnt.offsetTop - pos2);
            let finalLeft = (elmnt.offsetLeft - pos1);
            if (
                (finalTop >= 0 &&
                finalTop <= elmnt.parentElement.offsetHeight - elmnt.offsetHeight)
                &&
                (finalLeft >= 0 &&
                finalLeft <= elmnt.parentElement.offsetWidth - elmnt.offsetWidth)
            ) {
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
        function resizeMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementResize;
        }

        // https://codepen.io/zz85/pen/gbOoVP?editors=1111
        function elementResize(e) {
            
            if (calEdgeConfig.rightedge)
            {
                //if ((calvalue.x+elmnt.offsetLeft) < (_this.cropActionConfig.maxWidth-_this.cropActionConfig.margin)) 
                {
                    elmnt.style.width = Math.max(calvalue.x, _this.cropActionConfig.minWidth) + 'px';
                }
            } 
            if (calEdgeConfig.bottomedge) {
                //if ((calvalue.y+elmnt.offsetTop) < _this.cropActionConfig.maxHeight-_this.cropActionConfig.margin) 
                {
                    elmnt.style.height = Math.max(calvalue.y, _this.cropActionConfig.minHeight) + 'px';
                }
            } 
            
        }
    }
    canMove(calcValue) {
        return calcValue.x > 0 && calcValue.x < calcValue.b.width && calcValue.y > 0 && calcValue.y < calcValue.b.height;
    }
    calc(e, pane) {
        let MARGINS = this.cropActionConfig.margin;
        let b = pane.getBoundingClientRect();
        let x = e.clientX - b.left;
        let y = e.clientY - b.top;

        let onTopEdge = y < MARGINS;
        let onLeftEdge = x < MARGINS;
        let onRightEdge = x >= b.width - MARGINS;
        let onBottomEdge = y >= b.height - MARGINS;

        let rightScreenEdge = window.innerWidth - MARGINS;
        let bottomScreenEdge = window.innerHeight - MARGINS;
        return {
            b:b,
            x: x,
            y: y,
            topedge: onTopEdge,
            leftedge: onLeftEdge,
            rightedge: onRightEdge,
            bottomedge: onBottomEdge,
            rightscreenedge: rightScreenEdge,
            bottomscreenedge: bottomScreenEdge
        }
    }
}