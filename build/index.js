"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const snackbar_1 = require("./snackbar");
const config_1 = require("./config");
//constants
//connect modal elements
const connect_wallet_button = document.querySelector('.connect-wallet');
const phantom = document.getElementById('Phantom');
const solflare = document.getElementById('Solflare');
const brave = document.getElementById('Brave');
const modal = document.querySelector('.modal1');
const modal_content = document.querySelector('.modal1-box');
const return_button = document.querySelector('#quit');
const progress_wrapper = document.querySelector('.progress-wrapper');
const wallet_options_dropdown = document.querySelector('.wallet-drop-down');
const x_images = document.querySelectorAll('.x-image');
//burn woopa modal elements
const burn_woopa = document.querySelector('.burn-woopa');
const modal2 = document.querySelector('.modal2');
const sliderBar = document.querySelector('.slider-bar');
const sliderProgress = document.querySelector('.slider-progress');
const sliderHandle = document.querySelector('.slider-handle');
const sliderValue = document.querySelector('.slider-value');
const deposit_amount_indicator = document.querySelector('.amount-indicator');
const deposit_max_button = document.querySelector('.max-button');
const deposit_modal_button = document.querySelector('.deposit-modal-button');
const deposit_modal_return = document.querySelector('.wallet-btn.deposit-modal-button.return');
//data fields
const sol_balance = document.querySelector('.sol-balance');
const woopa_balance = document.querySelector('.woopa-balance');
const goo_points = document.querySelector('.goo-points');
const held_nfts = document.querySelector('.held-nfts');
const staked_nfts = document.querySelector('.staked-nfts');
const unstaked_nfts = document.querySelector('.unstaked-nfts');
const rate = document.querySelector('.rate');
const unclaimed = document.querySelector('.unclaimed');
//ledger
const checkbox = document.querySelector('.check-box input');
//stake field
const unstaked_field = document.querySelector('.unstaked-middle');
const staked_field = document.querySelector('.staked-middle');
var stake_buttons = document.querySelectorAll('.stake-buttons');
var claim = document.querySelector('.claim');
var stake = document.querySelector('.stake');
var stake_all = document.querySelector('.stake-all');
var unstake = document.querySelector('.unstake');
var unstake_all = document.querySelector('.unstake-all');
//button for snackbar
const button1 = document.querySelector('.button1');
//loading indicators
const connect_loading_ind = document.querySelector('.loader--style8');
const loader_text = document.querySelector('.loader-prompt');
//arrow for moving up to the page elements
const view_up_button = document.querySelector('.up-arrow-container');
const arrow_pic = document.querySelector('.up-arrow1');
//daily rate and burn rate
const daily_rate = 100;
const woopa_to_points_rate = 0.0005;
//variables
//wallet info
var wallet_type = '';
var owner = '';
//for interval
var temp_id = null;
//for scroll up button
var view_button_pop = false;
var is_arrow_animating = false;
//for wallet dropdown
var wallet_dropdown_vis = false;
//for ledger
var isChecked = false;
//info variables
var held_woopa = 0;
var held_NFTs = -1;
var staked_list = [];
var base_points = 0;
var goo_points_val = 0;
//for woopa modal
var isDragging = false;
var value = 0;
//concurrency control
var heavyPartQueue = [];
var processingCount = 0;
function reset_everything() {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (wallet_type === 'phantom') {
                yield window.solana.disconnect();
            }
            else if (wallet_type === 'solflare') {
                yield window.solflare.disconnect();
            }
            else {
                yield window.solana.disconnect();
            }
            (0, snackbar_1.showAlert)('Wallet disconnected', true, button1);
        }
        catch (e) {
            (0, snackbar_1.showAlert)('Failed to disconnect', false, button1);
        }
        wallet_options_dropdown.classList.remove('wallet-drop-down-visible');
        wallet_dropdown_vis = false;
        //disabling stake buttons
        stake_buttons.forEach(e => {
            const ele = e;
            ele.classList.add('stake-disabled');
        });
        const clonedclaim = claim.cloneNode(true);
        const clonedstake = stake.cloneNode(true);
        const clonedunstake = unstake.cloneNode(true);
        const clonedstake_all = stake_all.cloneNode(true);
        const clonedUnstake_all = unstake_all.cloneNode(true);
        (_a = claim.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(clonedclaim, claim);
        (_b = stake.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(clonedstake, stake);
        (_c = unstake.parentNode) === null || _c === void 0 ? void 0 : _c.replaceChild(clonedunstake, unstake);
        (_d = stake_all.parentNode) === null || _d === void 0 ? void 0 : _d.replaceChild(clonedstake_all, stake_all);
        (_e = unstake_all.parentNode) === null || _e === void 0 ? void 0 : _e.replaceChild(clonedUnstake_all, unstake_all);
        claim = document.querySelector('.claim');
        stake = document.querySelector('.stake');
        stake_all = document.querySelector('.stake-all');
        unstake = document.querySelector('.unstake');
        unstake_all = document.querySelector('.unstake-all');
        stake.children[0].textContent = 'Stake';
        unstake.children[0].textContent = 'Unstake';
        stake_all.children[0].textContent = 'Stake All';
        unstake_all.children[0].textContent = 'Unstake All';
        claim.children[0].textContent = 'Claim';
        deposit_modal_button.removeEventListener('click', exchange_woopa);
        stake_buttons = document.querySelectorAll('.stake-buttons');
        //enabling stake buttons
        stake_buttons.forEach(e => {
            const ele = e;
            if (ele.classList.contains('burn-woopa') || ele.classList.contains('deposit-modal-button')) {
                return;
            }
            ele.addEventListener('click', () => {
                if (owner == '') {
                    (0, snackbar_1.showAlert)('Connect your wallet first', false, button1);
                }
            });
        });
        //wallet info
        setTimeout(() => {
            wallet_type = '';
            owner = '';
        }, 300);
        //for wallet dropdown
        wallet_dropdown_vis = false;
        //info variables
        held_woopa = 0;
        held_NFTs = -1;
        staked_list = [];
        base_points = 0;
        goo_points_val = 0;
        //for woopa modal
        isDragging = false;
        value = 0;
        //concurrency control
        heavyPartQueue = [];
        processingCount = 0;
        const display_key = 'Connect';
        connect_wallet_button.children[0].innerHTML = display_key;
        //setting appropriate event listener for wallet button
        connect_wallet_button.removeEventListener('click', show_wallet_drop_down);
        connect_wallet_button.addEventListener('click', show_connect_modal);
        goo_points.children[1].textContent = '0';
        woopa_balance.children[1].textContent = '0';
        sol_balance.children[1].textContent = '0';
        held_nfts.children[1].textContent = '0';
        staked_nfts.children[1].textContent = '0';
        unstaked_nfts.children[1].textContent = '0';
        rate.innerHTML = '<span>Rate: </span>' + '0' + ' Points/Day';
        const interval_id = setInterval(() => {
            const elements = document.querySelectorAll('.card');
            // Remove elements with class name 'card'
            elements.forEach((ele) => {
                ele.remove();
            });
        }, 300);
        setTimeout(() => {
            clearInterval(interval_id);
        }, 2000);
    });
}
//sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//number formatter
function formatNumberWithCommas(number) {
    const numberParts = number.toString().split('.');
    const wholePart = numberParts[0];
    const decimalPart = numberParts[1] || '';
    let formattedNumber = '';
    for (let i = wholePart.length - 1; i >= 0; i--) {
        const digit = wholePart[i];
        if (i !== wholePart.length - 1 && (wholePart.length - i - 1) % 3 === 0) {
            formattedNumber = ',' + formattedNumber;
        }
        formattedNumber = digit + formattedNumber;
    }
    if (decimalPart) {
        formattedNumber += '.' + decimalPart;
    }
    return formattedNumber;
}
function processHeavyPart(img_link, card_div) {
    return new Promise((resolve) => {
        const real_img = document.createElement('img');
        real_img.classList.add('gooberg-image');
        real_img.src = img_link;
        real_img.crossOrigin = "anonymous"; // Add the crossorigin attribute
        real_img.onload = () => {
            var TARGET_RESOLUTION = 1080; // Set the target resolution in pixels
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            // Calculate the new dimensions based on the target resolution
            var width = real_img.width;
            var height = real_img.height;
            var aspectRatio = width / height;
            var targetWidth = TARGET_RESOLUTION;
            var targetHeight = TARGET_RESOLUTION / aspectRatio;
            // Set the canvas dimensions to the new width and height
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            // Draw the image on the canvas with the new dimensions
            ctx.drawImage(real_img, 0, 0, targetWidth, targetHeight);
            // Get the compressed image as a base64-encoded data URL
            var compressedDataURL = canvas.toDataURL('image/jpeg', 0.7); // Adjust the JPEG quality as needed
            // Clean up resources
            URL.revokeObjectURL(real_img.src); // Revoke the object URL
            canvas = null; // Release the canvas object
            // Set the base64-encoded data URL as the source of the <img> element
            real_img.src = compressedDataURL; // Update the src with the compressed data URL
            // Clean up event listeners
            real_img.onload = null;
            card_div.replaceChild(real_img, card_div.children[1]);
            resolve();
        };
    });
}
// Process the heavy part of generate_card with concurrency control
function processHeavyPartQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        while (processingCount < 1 && heavyPartQueue.length > 0) {
            //@ts-ignore
            const { img_link, card_div } = heavyPartQueue.shift();
            processingCount++;
            yield processHeavyPart(img_link, card_div);
            // Allow time for other operations
            processingCount--;
        }
    });
}
//generating an NFT card to be displayed
function generate_card(mint_address, name, img_link) {
    const card_div = document.createElement('div');
    const name_div = document.createElement('div');
    const temp_img = document.createElement('img');
    card_div.setAttribute('id', mint_address);
    temp_img.src = '../assets/waba_gif.gif';
    name_div.innerHTML = `<span>${name}</span>`;
    temp_img.classList.add('gooberg-image');
    name_div.classList.add('gooberg-name');
    card_div.classList.add('card');
    const me_img = document.createElement('img');
    me_img.classList.add('mini-image');
    me_img.src = '../assets/ME.png';
    me_img.onclick = () => {
        window.open("https://magiceden.io/item-details/" + mint_address, "_blank");
    };
    const solscan_img = document.createElement('img');
    solscan_img.classList.add('mini-image');
    solscan_img.src = '../assets/solscan.png';
    solscan_img.onclick = () => {
        window.open("https://solscan.io/token/" + mint_address, "_blank");
    };
    const mini_image_wrapper = document.createElement('div');
    mini_image_wrapper.classList.add('mini-image-wrapper');
    mini_image_wrapper.appendChild(me_img);
    mini_image_wrapper.appendChild(solscan_img);
    card_div.appendChild(mini_image_wrapper);
    card_div.appendChild(temp_img);
    card_div.appendChild(name_div);
    heavyPartQueue.push({ img_link, card_div });
    processHeavyPartQueue();
    return card_div;
}
function update_live_points(stakedNFTs) {
    const element = unclaimed;
    let rate = stakedNFTs * (daily_rate / (1000 * 60 * 60 * 24) * 200); // Calculate rate per 200 milliseconds
    const intervalId = setInterval(() => {
        if (owner && staked_list.length != 0) {
            unclaimed.innerHTML = '<span>Unclaimed Points: </span>' + (base_points + rate).toFixed(3).toString();
            base_points = (base_points + rate);
        }
        else {
            clearInterval(intervalId); // If the element is not found, stop the interval
        }
    }, 200);
}
//disbaled stake buttons
//fetch balance function
function get_sol_balance() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = 0;
        yield fetch(config_1.config + '/get_balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                address: owner,
            })
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = 0;
        });
        return res;
    });
}
;
function get_woopa_balance() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = 0;
        yield fetch(config_1.config + '/get_woopa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                address: owner,
            })
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = 0;
        });
        return res;
    });
}
;
function get_goobergs() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = [];
        yield fetch(config_1.config + '/get_goobergs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                address: owner,
            })
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = [];
        });
        return res;
    });
}
;
function get_gooberg_data(address_list) {
    return __awaiter(this, void 0, void 0, function* () {
        var res = [];
        yield fetch(config_1.config + '/get_gooberg_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                query: address_list,
            })
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = [];
        });
        return res;
    });
}
;
function get_points_and_staked_data() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = [];
        yield fetch(config_1.config + '/get_points_and_staked_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                address: owner,
            })
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = [0, 0, []];
        });
        return res;
    });
}
;
function get_total_staked() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = 0;
        yield fetch(config_1.config + '/get_total_staked', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
        })
            .then(response => response.json())
            .then(data => {
            res = data;
        })
            .catch(error => {
            res = 0;
        });
        return res;
    });
}
;
//getting burn transaction
function claim_points(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var res = '';
            yield fetch(config_1.config + '/claim_points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    owner: owner,
                    message: message,
                    ledger: isChecked
                })
            })
                .then(response => response.json())
                .then(data => {
                res = data;
            })
                .catch(error => {
                res = 'failed';
            });
            return res;
        }
        catch (e) {
            return 'failed';
        }
    });
}
//getting burn transaction
function get_burn_transaction(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var transaction = '';
            yield fetch(config_1.config + '/get_burn_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    owner_address: owner,
                    amount: amount,
                })
            })
                .then(response => response.json())
                .then(data => {
                transaction = data;
            })
                .catch(error => {
                transaction = 'failed from frontend';
            });
            return transaction;
        }
        catch (e) {
            return 'failed';
        }
    });
}
function verify_burn_transaction(sig) {
    return __awaiter(this, void 0, void 0, function* () {
        var worked = 1;
        yield fetch(config_1.config + '/verify_burn_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                signature: sig,
            })
        })
            .then(response => response.json())
            .then(data => {
            worked = data;
        })
            .catch(error => {
            worked = 0;
        });
        return worked;
    });
}
//getting burn transaction
function get_ledger_transaction() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var transaction = '';
            yield fetch(config_1.config + '/get_ledger_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    owner_address: owner,
                })
            })
                .then(response => response.json())
                .then(data => {
                transaction = data;
            })
                .catch(error => {
                transaction = 'failed from frontend';
            });
            return transaction;
        }
        catch (e) {
            return 'failed';
        }
    });
}
//getting burn transaction
function get_lock_transactions(mint_list) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var transaction = [];
            yield fetch(config_1.config + '/get_lock_transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    owner_address: owner,
                    mint_list: mint_list,
                })
            })
                .then(response => response.json())
                .then(data => {
                transaction = data;
            })
                .catch(error => {
                transaction = 'failed';
            });
            return transaction;
        }
        catch (e) {
            return 'failed';
        }
    });
}
//getting burn transaction
function get_unlock_transactions(mint_list) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var transaction = [];
            yield fetch(config_1.config + '/get_unlock_transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    owner_address: owner,
                    mint_list: mint_list,
                })
            })
                .then(response => response.json())
                .then(data => {
                transaction = data;
            })
                .catch(error => {
                transaction = 'failed';
            });
            return transaction;
        }
        catch (e) {
            return 'failed';
        }
    });
}
function adjust_post_burn(amount) {
    woopa_balance.children[1].textContent = formatNumberWithCommas((held_woopa - amount).toString().substring(0, 15));
    const init = parseFloat(goo_points.children[1].textContent);
    goo_points.children[1].textContent = (init + (amount * woopa_to_points_rate)).toFixed(2).toString();
}
function adjust_post_claim() {
    const init = parseFloat(goo_points.children[1].textContent);
    goo_points.children[1].textContent = (init + base_points).toFixed(2).toString();
    base_points = 0;
}
function adjust_post_stake(is_staked, mint_list) {
    return __awaiter(this, void 0, void 0, function* () {
        const field_elements = is_staked ? document.querySelectorAll('.staked-middle .card') : document.querySelectorAll('.unstaked-middle .card');
        const counter_field = is_staked ? unstaked_field : staked_field;
        field_elements.forEach((ele) => {
            const element = ele;
            const id = ele.getAttribute('id');
            if ((id) && mint_list.includes(id)) {
                element.remove();
                counter_field.appendChild(ele);
            }
        });
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield get_points_and_staked_data().then((data) => {
                staked_list = data[2];
                goo_points.children[1].textContent = data[0].toFixed(2).toString();
                goo_points_val = data[0];
                unclaimed.innerHTML = '<span>Unclaimed Points: </span>' + data[1].toFixed(2).toString();
                base_points = data[1];
                update_live_points(data[2].length);
                rate.innerHTML = '<span>Rate: </span>' + (data[2].length * daily_rate).toString() + ' Points/Day';
                staked_nfts.children[1].textContent = data[2].length.toString();
                unstaked_nfts.children[1].textContent = (parseInt(held_nfts.children[1].textContent) - parseInt(staked_nfts.children[1].textContent)).toString();
                get_total_staked().then((data) => {
                    const amount_staked = data;
                    const res = (amount_staked / 3727) * 100;
                    const percentage = progress_wrapper.children[1];
                    const progress_indicator = progress_wrapper.children[0];
                    percentage.textContent = `${(res).toString().substring(0, 6)}% (${amount_staked}/3727)`;
                    progress_indicator.style.width = `${(res).toString().substring(0, 6)}%`;
                    if (res >= 48) {
                        percentage.style.color = 'black';
                    }
                });
            });
        }), 5000);
    });
}
function get_mint_list(is_staked, is_all) {
    const mint_list = [];
    const field_elements = is_staked ? document.querySelectorAll('.staked-middle .card') : document.querySelectorAll('.unstaked-middle .card');
    field_elements.forEach(ele => {
        const id = ele.getAttribute('id');
        if (is_all || (!is_all && ele.classList.contains('card-selected'))) {
            mint_list.push(id);
        }
    });
    return mint_list;
}
function show_x_mark(is_stake) {
    const pageWidth = window.innerWidth;
    if (pageWidth < 652) {
        return;
    }
    else {
        if (is_stake) {
            x_images[0].classList.add('x-image-visible');
        }
        else {
            x_images[1].classList.add('x-image-visible');
        }
    }
}
function hide_x_mark(is_stake) {
    const pageWidth = window.innerWidth;
    if (pageWidth < 652) {
        return;
    }
    else {
        if (is_stake) {
            x_images[0].classList.remove('x-image-visible');
        }
        else {
            x_images[1].classList.remove('x-image-visible');
        }
    }
}
function staking_counter() {
    var _a;
    const target = this;
    const is_selected = target.classList.contains('card-selected');
    const is_stake = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.classList.contains('unstaked-middle');
    const curr_text = is_stake ? stake.children[0].textContent : unstake.children[0].textContent;
    if ((is_stake && curr_text == 'Stake') || (!is_stake && curr_text == 'Unstake')) {
        if (is_stake) {
            stake.children[0].textContent = 'Stake(1)';
            show_x_mark(is_stake);
        }
        else {
            unstake.children[0].textContent = 'Unstake(1)';
            unstake.style.width = '150px';
            show_x_mark(is_stake);
        }
    }
    else if (((is_stake && curr_text == 'Stake(1)') || (!is_stake && curr_text == 'Unstake(1)')) && is_selected) {
        if (is_stake) {
            stake.children[0].textContent = 'Stake';
            hide_x_mark(is_stake);
        }
        else {
            unstake.children[0].textContent = 'Unstake';
            unstake.style.width = '150px';
            hide_x_mark(is_stake);
        }
    }
    else {
        const numbers = curr_text.match(/\d+/g); // Extract all numeric values from the string
        const concatenatedNumber = numbers ? numbers.join('') : ''; // Concatenate the numeric values                            
        if (is_stake) {
            stake.children[0].textContent = `Stake(${parseInt(concatenatedNumber) + (is_selected ? -1 : 1)})`;
        }
        else {
            if (parseInt(concatenatedNumber) >= 9 && !is_selected) {
                unstake.style.width = '175px';
            }
            else if (parseInt(concatenatedNumber) == 10 && is_selected) {
                unstake.style.width = '150px';
            }
            unstake.children[0].textContent = `Unstake(${parseInt(concatenatedNumber) + (is_selected ? -1 : 1)})`;
        }
    }
    this.classList.toggle('card-selected');
}
function clear_selections(is_staked) {
    const field_elements = is_staked ? document.querySelectorAll('.staked-middle .card') : document.querySelectorAll('.unstaked-middle .card');
    const button = is_staked ? unstake : stake;
    button.children[0].textContent = is_staked ? 'Unstake' : 'Stake';
    field_elements.forEach((ele) => {
        try {
            ele.classList.remove('card-selected');
        }
        catch (e) {
        }
    });
}
function handle_staking(mint_list, is_staking) {
    return __awaiter(this, void 0, void 0, function* () {
        if (is_staking) {
            if (mint_list.length == 0) {
                (0, snackbar_1.showAlert)('No Goobergs to stake!', false, button1);
                return;
            }
            if (!isChecked) {
                dim('Waiting for message signature verification');
                var signed_message = yield sign_message();
                if (signed_message == 'failed') {
                    (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                    undim('');
                    return;
                }
            }
            else {
                dim('Waiting for message signature verification');
                const transactions = yield get_ledger_transaction();
                if (transactions === 'failed') {
                    (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                    undim('');
                    return;
                }
                var temp = yield sign_all_transactions([transactions]);
                if (temp === 'failed') {
                    (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                    undim('');
                    return;
                }
            }
            dim('verifying ownership.');
            yield sleep(500);
            const transactions = yield get_lock_transactions(mint_list);
            if (transactions === 'failed') {
                (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                undim('');
                return;
            }
            //waiting for trabsaction approval and signature
            dim('Waiting for Transaction Approval.');
            const signed_transactions = yield sign_all_transactions(transactions);
            if (signed_transactions === 'failed') {
                (0, snackbar_1.showAlert)('Transaction Signature Failed', false, button1);
                undim('');
                return;
            }
            //sending the transaction
            dim('Sending Transaction.');
            const sigs = yield send_all_lock_transaction(signed_transactions);
            if (sigs.length == 0) {
                (0, snackbar_1.showAlert)('Failed to Stake', false, button1);
                undim('');
                return;
            }
            (0, snackbar_1.showAlert)('Goobergs Staked!', true, button1);
            clear_selections(false);
            adjust_post_stake(false, sigs);
            undim('');
        }
        else {
            if (mint_list.length == 0) {
                (0, snackbar_1.showAlert)('No Goobergs to stake!', false, button1);
                return;
            }
            if (!isChecked) {
                dim('Waiting for message signature verification');
                var signed_message = yield sign_message();
                if (signed_message == 'failed') {
                    (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                    undim('');
                    return;
                }
            }
            else {
                dim('Waiting for message signature verification');
                const transactions = yield get_ledger_transaction();
                if (transactions === 'failed') {
                    (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                    undim('');
                    return;
                }
                var temp = yield sign_all_transactions([transactions]);
                if (temp === 'failed') {
                    (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                    undim('');
                    return;
                }
            }
            dim('verifying ownership.');
            yield sleep(500);
            const transactions = yield get_unlock_transactions(mint_list);
            if (transactions === 'failed') {
                (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                undim('');
                return;
            }
            //waiting for trabsaction approval and signature
            dim('Waiting for Transaction Approval.');
            const signed_transactions = yield sign_all_transactions(transactions);
            if (signed_transactions === 'failed') {
                (0, snackbar_1.showAlert)('Transaction Signature Failed', false, button1);
                undim('');
                return;
            }
            //sending the transaction
            dim('Sending Transaction.');
            const sigs = yield send_all_unlock_transaction(signed_transactions);
            if (sigs.length == 0) {
                (0, snackbar_1.showAlert)('Failed to Unstake', false, button1);
                undim('');
                return;
            }
            (0, snackbar_1.showAlert)('Goobergs Unstaked!', true, button1);
            clear_selections(true);
            adjust_post_stake(true, sigs);
            undim('');
        }
    });
}
function exchange_woopa() {
    return __awaiter(this, void 0, void 0, function* () {
        if (deposit_amount_indicator.textContent == '0') {
            (0, snackbar_1.showAlert)(`Amount cannot be zero! `, false, button1);
            return;
        }
        if (!isChecked) {
            dim('Waiting for message signature verification');
            var signed_message = yield sign_message();
            if (signed_message == 'failed') {
                (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                undim('');
                return;
            }
        }
        else {
            dim('Waiting for message signature verification');
            const transactions = yield get_ledger_transaction();
            if (transactions === 'failed') {
                (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                undim('');
                return;
            }
            var temp = yield sign_all_transactions([transactions]);
            if (temp === 'failed') {
                (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                undim('');
                return;
            }
        }
        dim('verifying ownership.');
        yield sleep(500);
        const transaction = yield get_burn_transaction(parseFloat(deposit_amount_indicator.textContent));
        if (transaction === 'failed') {
            (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
            undim('');
            return;
        }
        //waiting for trabsaction approval and signature
        dim('Waiting for Transaction Approval.');
        const signed_transaction = yield sign_transaction(transaction);
        if (signed_transaction === 'failed') {
            (0, snackbar_1.showAlert)('Transaction Signature Failed', false, button1);
            undim('');
            return;
        }
        //sending the transaction
        dim('Sending Transaction.');
        const sig = yield send_transaction(signed_transaction);
        if (sig === '') {
            (0, snackbar_1.showAlert)('Failed to send Transaction', false, button1);
            undim('');
            return;
        }
        dim('Verifying Transaction');
        const is_valid = yield verify_burn_transaction(sig);
        if (is_valid === 1) {
            (0, snackbar_1.showAlert)('Transaction Approved and Successfully sent!', true, button1);
            adjust_post_burn(parseFloat(deposit_amount_indicator.textContent));
            undim('');
            reset_deposit_modal();
        }
        else {
            (0, snackbar_1.showAlert)('Transaction verification failed', false, button1);
            undim('');
            reset_deposit_modal();
        }
    });
}
//wallet connect loader and modal dim/undim
function dim(content) {
    modal_content.style.display = 'none';
    modal.style.display = 'flex';
    connect_loading_ind.style.display = 'block';
    loader_text.style.display = 'block';
    loader_text.innerHTML = content;
}
function undim(content) {
    modal_content.style.display = 'block';
    modal.style.display = 'none';
    connect_loading_ind.style.display = 'none';
    loader_text.style.display = 'none';
    loader_text.innerHTML = '';
}
//signing a transaction
function sign_message() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const message = `Message Signature Requested From User.`;
            const encoded_msg = new TextEncoder().encode(message);
            //const transaction_buffer = Buffer.from(transaction,'base64');
            //const raw_tx = Transaction.from(transaction_buffer);
            if (wallet_type === 'phantom') {
                const signed_message = yield window.solana.signMessage(encoded_msg);
                return signed_message;
            }
            else if (wallet_type === 'solflare') {
                const signed_message = yield window.solflare.signMessage(encoded_msg, 'utf8');
                return signed_message;
            }
            else if (wallet_type === 'brave') {
                const signed_message = yield window.solana.signMessage(encoded_msg);
                return signed_message;
            }
        }
        catch (e) {
            console.log(e);
            return 'failed';
        }
    });
}
//function for signing a transaction
function sign_transaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction_buffer = Buffer.from(transaction, 'base64');
            const raw_tx = web3_js_1.Transaction.from(transaction_buffer);
            if (wallet_type === 'phantom') {
                const signed_transaction = yield window.solana.signTransaction(raw_tx, { skipPreflight: true });
                return signed_transaction;
            }
            else if (wallet_type === 'solflare') {
                const signed_transaction = yield window.solflare.signTransaction(raw_tx);
                return signed_transaction;
            }
            else if (wallet_type === 'brave') {
                const signed_transaction = yield window.braveSolana.signTransaction(raw_tx, { skipPreflight: true });
                return signed_transaction;
            }
        }
        catch (e) {
            return 'failed';
        }
    });
}
//function for signing a transaction
function sign_all_transactions(transactions) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transactionBuffers = transactions.map((transaction) => Buffer.from(transaction, 'base64'));
            const rawTransactions = transactionBuffers.map((transactionBuffer) => web3_js_1.Transaction.from(transactionBuffer));
            if (wallet_type === 'phantom') {
                const signed_transaction = yield window.solana.signAllTransactions(rawTransactions, { skipPreflight: true });
                return signed_transaction;
            }
            else if (wallet_type === 'solflare') {
                const signed_transaction = yield window.solflare.signAllTransactions(rawTransactions);
                return signed_transaction;
            }
            else if (wallet_type === 'brave') {
                const signed_transaction = yield window.braveSolana.signAllTransactions(rawTransactions, { skipPreflight: true });
                return signed_transaction;
            }
        }
        catch (e) {
            return 'failed';
        }
    });
}
function send_transaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const temp = transaction.serialize({ requireAllSignatures: true, verifySignatures: true });
        const transactionBase64 = Buffer.from(temp).toString('base64');
        var sig = '';
        yield fetch(config_1.config + '/submit_transaction', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serialized_transaction: transactionBase64
            }),
        })
            .then(response => response.json())
            .then(data => {
            sig = data;
        })
            .catch(error => {
            console.log(error);
            sig = '';
        });
        return sig;
    });
}
function send_all_lock_transaction(transactions) {
    return __awaiter(this, void 0, void 0, function* () {
        const temp = transactions.map((transaction) => {
            const serialized = transaction.serialize(({ requireAllSignatures: true, verifySignatures: true }));
            return Buffer.from(serialized).toString('base64');
        });
        var sigs = [];
        yield fetch(config_1.config + '/submit_all_lock_transactions', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serialized_transactions: temp,
                owner: owner
            }),
        })
            .then(response => response.json())
            .then(data => {
            sigs = data;
        })
            .catch(error => {
            console.log(error);
            sigs = [];
        });
        return sigs;
    });
}
function send_all_unlock_transaction(transactions) {
    return __awaiter(this, void 0, void 0, function* () {
        const temp = transactions.map((transaction) => {
            const serialized = transaction.serialize(({ requireAllSignatures: true, verifySignatures: true }));
            return Buffer.from(serialized).toString('base64');
        });
        var sigs = [];
        yield fetch(config_1.config + '/submit_all_unlock_transactions', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serialized_transactions: temp,
                owner: owner
            }),
        })
            .then(response => response.json())
            .then(data => {
            sigs = data;
        })
            .catch(error => {
            console.log(error);
            sigs = [];
        });
        return sigs;
    });
}
//checking if selected wallet is installed
function check_wallet() {
    //phantom check
    if (wallet_type === 'phantom') {
        if (!window.solana || !window.solana.isPhantom) {
            (0, snackbar_1.showAlert)('Phantom Wallet is not installed!', false, button1);
            return false;
        }
        else {
            return true;
        }
    }
    //solflare check
    if (wallet_type === 'solflare') {
        if (!window.solflare || !window.solflare.isSolflare) {
            (0, snackbar_1.showAlert)('Solflare Wallet is not installed!', false, button1);
            return false;
        }
        else {
            return true;
        }
    }
    //brave wallet check
    if (wallet_type === 'brave') {
        if (!window.braveSolana || !window.braveSolana.isBraveWallet) {
            (0, snackbar_1.showAlert)('Brave Wallet is not installed!', false, button1);
            return false;
        }
        else {
            return true;
        }
    }
}
//connecting to the wallet after checking it's installation
function connect_wallet(is_eager) {
    return __awaiter(this, void 0, void 0, function* () {
        if (wallet_type === 'phantom') {
            try {
                yield window.solana.connect({ onlyIfTrusted: is_eager ? true : false }).then((obje) => {
                    owner = window.solana.publicKey.toString();
                    (0, snackbar_1.showAlert)('Phantom Wallet successfully connected!', true, button1);
                });
                return true;
            }
            catch (e) {
                if (!is_eager) {
                    (0, snackbar_1.showAlert)('Failed to connect to Phantom Wallet!', false, button1);
                }
                return false;
            }
        }
        if (wallet_type === 'brave') {
            try {
                yield window.solana.connect({ onlyIfTrusted: is_eager ? true : false }).then((obje) => {
                    owner = window.solana.publicKey.toString();
                    (0, snackbar_1.showAlert)('Brave Wallet successfully connected!', true, button1);
                });
                return true;
            }
            catch (e) {
                if (!is_eager) {
                    (0, snackbar_1.showAlert)('Failed to connect to Brave Wallet!', false, button1);
                }
                return false;
            }
        }
        if (wallet_type === 'solflare') {
            try {
                yield window.solflare.connect({ onlyIfTrusted: is_eager ? true : false }).then((obje) => {
                    owner = window.solflare.publicKey.toString();
                    (0, snackbar_1.showAlert)('Solflare Wallet successfully connected!', true, button1);
                });
                return true;
            }
            catch (e) {
                if (!is_eager) {
                    (0, snackbar_1.showAlert)('Failed to connect to Solflare Wallet!', false, button1);
                }
                return false;
            }
        }
    });
}
//main function
function main(eager) {
    return __awaiter(this, void 0, void 0, function* () {
        dim('');
        //checking selected wallet
        const is_installed = check_wallet();
        if (!is_installed) {
            modal_content.style.display = 'block';
            connect_loading_ind.style.display = 'none';
            //return early from the function
            return;
        }
        dim('A pop-up should appear from<br/>your wallet extension to connect.');
        //else we connect to the selected wallet
        const connected = eager ? true : yield connect_wallet(false);
        if (!connected) {
            dim('');
            modal_content.style.display = 'block';
            connect_loading_ind.style.display = 'none';
            //return early from the function
            return;
        }
        else {
            try {
                window.solana.on('accountChanged', () => {
                    location.reload();
                });
            }
            catch (_a) { }
            try {
                window.solflare.on('accountChanged', () => {
                    location.reload();
                });
            }
            catch (_b) { }
            get_sol_balance().then(sol => {
                const bal = (sol / (1000000000)).toString().substring(0, 6);
                sol_balance.children[1].textContent = bal;
            });
            get_woopa_balance().then(woopa => {
                held_woopa = woopa;
                woopa_balance.children[1].textContent = formatNumberWithCommas(woopa.toString().substring(0, 15));
            });
            yield get_points_and_staked_data().then((data) => {
                staked_list = data[2];
                goo_points.children[1].textContent = data[0].toFixed(2).toString();
                goo_points_val = data[0];
                unclaimed.innerHTML = '<span>Unclaimed Points: </span>' + data[1].toFixed(2).toString();
                base_points = data[1];
                update_live_points(data[2].length);
                rate.innerHTML = '<span>Rate: </span>' + (data[2].length * daily_rate).toString() + ' Points/Day';
                staked_nfts.children[1].textContent = data[2].length.toString();
                const id = setInterval(() => {
                    if (held_NFTs != -1) {
                        clearInterval(id);
                        unstaked_nfts.children[1].textContent = (held_NFTs - data[2].length).toString();
                    }
                }, 200);
            });
            get_goobergs().then((res) => __awaiter(this, void 0, void 0, function* () {
                held_nfts.children[1].textContent = res.length.toString();
                held_NFTs = res.length;
                var tempArray = [];
                for (let i = 0; i < res.length; i++) {
                    tempArray.push(res[i]);
                    if (tempArray.length === 3 || i === res.length - 1) {
                        if (!owner) {
                            return;
                        }
                        const data = yield get_gooberg_data(tempArray);
                        data.forEach(ele => {
                            if (!owner) {
                                return;
                            }
                            const card = generate_card(ele[0], ele[1], ele[2]);
                            if (staked_list.includes(ele[0])) {
                                staked_field.appendChild(card);
                            }
                            else {
                                unstaked_field.appendChild(card);
                            }
                            card.addEventListener('click', staking_counter);
                        });
                        tempArray = [];
                    }
                }
            }));
            undim('');
            const display_key = owner.substring(0, 6) + '..' + '&#160&#160▾';
            connect_wallet_button.children[0].innerHTML = display_key;
            if (!eager) {
                modal_content.style.display = 'block';
            }
            //setting appropriate event listener for wallet button
            connect_wallet_button.removeEventListener('click', show_connect_modal);
            connect_wallet_button.addEventListener('click', show_wallet_drop_down);
            //enabliung stake buttons
            stake_buttons.forEach(e => {
                const ele = e;
                ele.classList.remove('stake-disabled');
            });
            deposit_modal_button.addEventListener('click', exchange_woopa);
            claim.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                if (!isChecked) {
                    dim('Waiting for message signature verification');
                    var signed_message = yield sign_message();
                    if (signed_message == 'failed') {
                        (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                        undim('');
                        return;
                    }
                }
                else {
                    dim('Waiting for message signature verification');
                    const transactions = yield get_ledger_transaction();
                    if (transactions === 'failed') {
                        (0, snackbar_1.showAlert)('Failed to fetch Transaction', false, button1);
                        undim('');
                        return;
                    }
                    var signed_transactions = yield sign_all_transactions([transactions]);
                    if (signed_transactions === 'failed') {
                        (0, snackbar_1.showAlert)('Ownership verification failed', false, button1);
                        undim('');
                        return;
                    }
                }
                dim('Claiming Points');
                yield sleep(500);
                const res = yield claim_points(!isChecked ? (Buffer.from(signed_message.signature).toString('base64')) : Buffer.from(signed_transactions[0].serialize({ requireAllSignatures: true, verifySignatures: true })).toString('base64'));
                if (res === 'failed') {
                    (0, snackbar_1.showAlert)('Failed to claim points', false, button1);
                    undim('');
                    return;
                }
                else {
                    (0, snackbar_1.showAlert)('Claim successful!', true, button1);
                    adjust_post_claim();
                    undim('');
                }
            }));
            stake.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                const target = event.target;
                const mint_list = get_mint_list(false, false);
                if (target.tagName != 'IMG') {
                    handle_staking(mint_list, true);
                }
            }));
            stake_all.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                const target = event.target;
                const mint_list = get_mint_list(false, true);
                if (target.tagName != 'IMG') {
                    handle_staking(mint_list, true);
                }
            }));
            unstake.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                const target = event.target;
                const mint_list = get_mint_list(true, false);
                if (target.tagName != 'IMG') {
                    handle_staking(mint_list, false);
                }
            }));
            unstake_all.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                const target = event.target;
                const mint_list = get_mint_list(true, true);
                if (target.tagName != 'IMG') {
                    handle_staking(mint_list, false);
                }
            }));
        }
    });
}
//showing wallet dropdown options
const show_wallet_drop_down = () => {
    setTimeout(() => {
        wallet_options_dropdown.classList.add('wallet-drop-down-visible');
        wallet_dropdown_vis = true;
    }, 50);
};
//showing connect modal
const show_connect_modal = () => {
    modal.style.display = 'flex';
};
connect_wallet_button.addEventListener('click', show_connect_modal);
//adding event listeners to all wallet buttons
wallet_options_dropdown.children[0].addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield navigator.clipboard.writeText(owner);
    (0, snackbar_1.showAlert)('Copied to Clipboard', true, button1);
}));
wallet_options_dropdown.children[1].addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const a = wallet_options_dropdown.children[1];
    a.href = `https://solscan.io/account/${owner}`;
}));
wallet_options_dropdown.children[2].addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    reset_everything();
}));
phantom.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    wallet_type = 'phantom';
    yield main(false);
}));
solflare.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    wallet_type = 'solflare';
    yield main(false);
}));
brave.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    wallet_type = 'brave';
    yield main(false);
}));
return_button.addEventListener('click', function (e) {
    modal.style.display = 'none';
});
//burn woopa modal functionality
function reset_deposit_modal() {
    modal2.style.display = 'none';
    sliderHandle.style.transform = `translateX(${0}px)`;
    sliderProgress.style.width = `${0}px`;
    deposit_amount_indicator.textContent = '0';
    updateValue();
}
const return_handler = () => {
    reset_deposit_modal();
};
deposit_modal_return.addEventListener('click', return_handler);
deposit_max_button.addEventListener('click', () => {
    sliderHandle.style.transform = `translateX(${68}px)`;
    sliderProgress.style.width = `${68}px`;
    const val = held_woopa;
    deposit_amount_indicator.textContent = `${Math.floor(val)}`;
    updateValue();
});
sliderHandle.addEventListener('mousedown', () => {
    isDragging = true;
});
sliderHandle.addEventListener('touchstart', () => {
    isDragging = true;
});
modal2.addEventListener('mouseup', () => {
    isDragging = false;
});
modal2.addEventListener('touchend', () => {
    isDragging = false;
});
modal2.addEventListener('mousemove', (event) => {
    event.preventDefault();
    if (isDragging) {
        const newPosition = event.pageX - sliderBar.getBoundingClientRect().left - sliderHandle.offsetWidth / 2;
        const sliderBarWidth = sliderBar.clientWidth;
        const sliderHandleWidth = sliderHandle.offsetWidth;
        const minPosition = 0;
        const maxPosition = sliderBarWidth - sliderHandleWidth;
        const boundedPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
        sliderHandle.style.transform = `translateX(${boundedPosition}px)`;
        sliderProgress.style.width = `${boundedPosition}px`;
        const percentage = updateValue();
        const val = held_woopa;
        deposit_amount_indicator.textContent = `${Math.floor(val * (percentage / 100))}`;
    }
});
modal2.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (isDragging) {
        const newPosition = event.touches[0].pageX - sliderBar.getBoundingClientRect().left - sliderHandle.offsetWidth / 2;
        const sliderBarWidth = sliderBar.clientWidth;
        const sliderHandleWidth = sliderHandle.offsetWidth;
        const minPosition = 0;
        const maxPosition = sliderBarWidth - sliderHandleWidth;
        const boundedPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
        sliderHandle.style.transform = `translateX(${boundedPosition}px)`;
        sliderProgress.style.width = `${boundedPosition}px`;
        const percentage = updateValue();
        const val = held_woopa;
        deposit_amount_indicator.textContent = `${Math.floor(val * (percentage / 100))}`;
    }
});
function updateValue() {
    const transformValue = sliderHandle.style.transform;
    const currentPosition = parseInt(transformValue.replace(/[^\d.-]/g, ''));
    const maxPosition = sliderBar.clientWidth - sliderHandle.offsetWidth;
    const percentage = Math.round(currentPosition / 68 * 100);
    value = percentage;
    sliderValue.innerText = `${value}%`;
    return percentage;
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        //eagerly connecting
        wallet_type = 'phantom';
        var res = yield connect_wallet(true);
        if (res) {
            main(true);
        }
        else {
            wallet_type = 'solflare';
            var res = yield connect_wallet(true);
            if (res) {
                main(true);
            }
            else {
                wallet_type = 'brave';
                var res = yield connect_wallet(true);
                if (res) {
                    main(true);
                }
                else {
                    wallet_type = '';
                }
            }
        }
        //enabling stake buttons
        stake_buttons.forEach(e => {
            const ele = e;
            ele.addEventListener('click', () => {
                if (owner == '') {
                    (0, snackbar_1.showAlert)('Connect your wallet first', false, button1);
                }
            });
        });
        document.addEventListener('click', () => {
            if (wallet_dropdown_vis) {
                wallet_options_dropdown.classList.remove('wallet-drop-down-visible');
                wallet_dropdown_vis = false;
            }
        });
        checkbox.addEventListener('change', function () {
            isChecked = checkbox.checked;
        });
        const first_x_mark = x_images[0];
        const second_x_mark = x_images[1];
        first_x_mark.addEventListener('click', () => {
            x_images[0].classList.remove('x-image-visible');
            const elements = document.querySelectorAll('.unstaked-middle .card');
            elements.forEach((ele) => {
                try {
                    ele.classList.remove('card-selected');
                    stake.children[0].textContent = 'Stake';
                }
                catch (e) { }
            });
        });
        second_x_mark.addEventListener('click', () => {
            x_images[1].classList.remove('x-image-visible');
            const elements = document.querySelectorAll('.staked-middle .card');
            elements.forEach((ele) => {
                try {
                    ele.classList.remove('card-selected');
                    unstake.children[0].textContent = 'Unstake';
                }
                catch (e) { }
            });
        });
        window.addEventListener('scroll', function () {
            if (window.scrollY >= 450 && !view_button_pop) {
                view_up_button.style.display = 'block';
                view_button_pop = true;
            }
            else if (window.scrollY < 450 && view_button_pop) {
                view_up_button.style.display = 'none';
                view_button_pop = false;
            }
        });
        //functionality and fancy effects for scroll up button
        view_up_button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        view_up_button.addEventListener('mouseover', () => {
            if (is_arrow_animating) {
                return;
            }
            is_arrow_animating = true;
            var num = 0;
            temp_id = setInterval(() => {
                num += 1;
                const duplicate = document.createElement('img');
                duplicate.src = arrow_pic.src;
                duplicate.style.cssText = arrow_pic.style.cssText;
                duplicate.className = arrow_pic.className;
                arrow_pic.parentNode.insertBefore(duplicate, arrow_pic.nextSibling);
                duplicate.classList.add('arrow-float-up');
                setTimeout(() => {
                    duplicate.remove();
                }, 500);
                if (num === 3) {
                    clearInterval(temp_id);
                    is_arrow_animating = false;
                }
            }, 500);
        });
        const connection_interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (!window.navigator.onLine) {
                dim('Connection Disconnected');
                const temp = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    if (window.navigator.onLine) {
                        clearInterval(temp);
                        location.reload();
                    }
                }), 1000);
                clearInterval(connection_interval);
            }
        }), 3000);
        get_total_staked().then((data) => {
            const amount_staked = data;
            const res = (amount_staked / 3727) * 100;
            const percentage = progress_wrapper.children[1];
            const progress_indicator = progress_wrapper.children[0];
            percentage.textContent = `${(res).toString().substring(0, 6)}% (${amount_staked}/3727)`;
            progress_indicator.style.width = `${(res).toString().substring(0, 6)}%`;
            if (res >= 48) {
                percentage.style.color = 'black';
            }
        });
        //enabling woopa burn button
        burn_woopa.addEventListener('click', () => {
            if (owner == '') {
                (0, snackbar_1.showAlert)('Connect your wallet first', false, button1);
            }
            else if (held_woopa == 0) {
                (0, snackbar_1.showAlert)('No $Woopa Found!', false, button1);
            }
            else {
                modal2.style.display = 'flex';
            }
        });
    });
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    setup();
});
