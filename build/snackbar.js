"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAlert = exports.Snackbar = void 0;
class Snackbar {
    constructor() {
        this.active = null;
        this.progress = -1;
        this.queue = [];
        this.timer = -1;
        // Durations (ms).
        // Should equal the CSS opacity transition.
        this.cssAnimationDelay = 500;
        // Should be 100x the CSS progress transition.
        this.visibilityDuration = 3000;
        // Create the DOM container.
        // This could be moved to a private function.
        const unid = "snackbar" + +new Date();
        const domElement = document.createElement('div');
        domElement.className = "snackbar";
        domElement.id = unid;
        document.body.appendChild(domElement);
        this.domElement = document.getElementById(unid);
        // This is the snackbar DOM element.
        this.snackElement = null;
        // This is the progress bar DOM element.
        this.progressElement = null;
        // Function bindings.
        this.hide = this.hide.bind(this);
    }
    hide(msg, is_good) {
        this.active = null;
        window.clearInterval(this.timer);
        // I'm making a bad assumption that this.snackElement
        // will always exist at this point.
        try {
            this.snackElement.classList.remove('active');
        }
        catch (e) {
            console.log(e);
        }
        // This timer ensures no snacks appear simultaneously
        // whilst allowing the element to transition (CSS).
        window.setTimeout(() => {
            // Remove the snack element completely.
            try {
                this.domElement.removeChild(this.snackElement);
            }
            catch (e) {
                console.log(e);
            }
            // Reset the progress.
            this.progress = -1;
            // If the queue isn't empty, show the next snack.
            if (this.queue.length)
                this.show(this.queue[0], true, msg, is_good);
        }, 500);
    }
    show(config, important, msg, is_good) {
        if (!config)
            return false;
        // Assign the config a UNID.
        if (!config._sbid)
            config._sbid = +new Date(); // Bad.
        const queuePopulated = this.queue.length;
        // If it's unimportant, add it to the queue.
        if (this.active && !important)
            return this.queue.push(config);
        // Otherwise, show it immediately.
        // If it's from the queue, remove it.
        if (queuePopulated && config._sbid === this.queue[0]._sbid)
            this.queue.shift();
        // If one is already active, place it back at the
        // start of the queue, ready to be displayed next.
        if (this.active) {
            this.queue.unshift(this.active);
            // Place this one at the front of the queue.
            this.queue.unshift(config);
            // Hide the current one.
            // This function will then grab the next one from
            // the queue, so we return.
            return this.hide(msg, is_good);
        }
        // Make it active.
        this.active = config;
        // Create the snack element. This would be a
        // private method in an actual implementation.
        const snackElement = document.createElement('div');
        snackElement.className = "snack";
        const snackMessage = document.createElement('span');
        snackMessage.innerText = msg;
        snackElement.appendChild(snackMessage);
        // Add the ✘ if it's dismissible.
        if (config.dismissible) {
            const dismissControl = document.createElement('button');
            dismissControl.type = 'button';
            dismissControl.innerText = '✘';
            dismissControl.onclick = this.hide;
            snackElement.appendChild(dismissControl);
            snackElement.classList.add('dismissible');
            if (is_good != true) {
                dismissControl.style.background = 'red';
            }
            else {
                dismissControl.style.background = 'rgb(2, 197, 197)';
            }
        }
        // Add in the progress bar.
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        if (is_good != true) {
            progressBar.style.background = 'red';
        }
        else {
            progressBar.style.background = 'rgb(2, 197, 197)';
        }
        snackElement.appendChild(progressBar);
        this.progressElement = progressBar;
        this.snackElement = snackElement;
        this.domElement.appendChild(snackElement);
        // Start the progress counter.
        this.timer = window.setInterval(() => {
            this.progress++;
            // If it's the first iteration, add the active
            // class to the element. Shh, this is a hack.
            if (this.progress === 0)
                this.snackElement.classList.add('active');
            // Increment the progress bar.
            const snackWidth = this.snackElement.clientWidth;
            this.progressElement.style.width = (this.progress / 100) * snackWidth + 'px';
            // If the progress is at 100, it's time to go.
            if (this.progress === 100)
                this.hide(msg, is_good);
        }, Math.round(this.visibilityDuration / 100));
    }
}
exports.Snackbar = Snackbar;
function showAlert(msg, is_good, ele) {
    const prevs = document.getElementsByClassName('snackbar');
    for (var i = 0; i < prevs.length; i++) {
        const element = prevs[i];
        element.classList.add('hide');
    }
    const alert = new Snackbar();
    alert.show(ele.dataset, false, msg, is_good);
}
exports.showAlert = showAlert;
