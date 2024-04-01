const axios = require('axios');
const express = require('express');
const app = express();

let CLEANEDDATA = {};
async function getDatas() {
    try {
        const request = await axios.get("https://secim2024.teimg.com/secim2024/data/president/cities.json");
        const iller = request.data.data;
        CLEANEDDATA = {};
        for (let index = 0; index < iller.length; index++) {
            const element = iller[index];
            CLEANEDDATA[element.cc] = {};
            CLEANEDDATA[element.cc].iladi = element.cn;
            CLEANEDDATA[element.cc].ilkodu = element.cc;
            CLEANEDDATA[element.cc].toplamsandik = Number(element.tbc);
            CLEANEDDATA[element.cc].acilansandik = Number(element.obc);
            CLEANEDDATA[element.cc].acilansandikyuzde = element.obp;
            CLEANEDDATA[element.cc].gecerlioysayisi = Number(element.vvc);
            CLEANEDDATA[element.cc].gecersizoysayisi = Number(element.uvc);
            CLEANEDDATA[element.cc].katilimorani = element.pp;
            CLEANEDDATA[element.cc].toplamoyvereceknufus = element.tpc;
            
            CLEANEDDATA[element.cc].adaylar = [];
            const belediyebaskanadaylari = element.cdts;
            let toplamadayasyisi = 0;
            for (let index = 0; index < belediyebaskanadaylari.length; index++) {
                toplamadayasyisi ++
                const adaybilgileri = belediyebaskanadaylari[index];
                if (adaybilgileri.pn == adaybilgileri.cn) {
                    adaybilgileri.pn = "Bağımsız Aday"
                } 
                CLEANEDDATA[element.cc].adaylar[index] = {
                    isim: adaybilgileri.cn,
                    fotograf: adaybilgileri.ci,
                    partiismi: adaybilgileri.pn || "Bağımsız Aday",
                    oyorani: adaybilgileri.vp,
                    oysayisi: Number(adaybilgileri.vc),
                    oncekisecim: {
                        oysayisi: adaybilgileri.past.vc,
                        oyorani: adaybilgileri.past.vp,
                    } 
                }
            }
        }
    } catch (error) {
        console.log(error)
        console.log("getDatas fonksiyonu hata verdi.")
    }

}
getDatas().then(()=>{
    console.log("Veriler getirildi!", new Date().toLocaleTimeString());
    setInterval(async() => {
        await getDatas();
        console.log("Veriler getirildi!", new Date().toLocaleTimeString());
    }, 30000);
});

let GENEL = {};
async function getDatas2() {
    try {
        const request = await axios.get("https://secim2024.teimg.com/secim2024/data/president/general.json");
        const data = request.data.data;
        GENEL = {};
        GENEL.toplamsandik = Number(data.tbc);
        GENEL.acilansandik = Number(data.obc);
        GENEL.acilansandikyuzde = data.obp;
        GENEL.gecerlioysayisi = Number(data.vvc);
        GENEL.gecersizoysayisi = Number(data.uvc);
        GENEL.oykullananyuzde = data.pp;

        const cdts = request.data.data.cdts;
        GENEL.partiler = [];
        for (let index = 0; index < cdts.length; index++) {
            const element = cdts[index];
            GENEL.partiler.push({
                name: element.cn,
                oyorani: element.vp,
                oysayisi: Number(element.vc),
                kazanilanilsayisi: Number(element.pc),
                kazanilanbuyukilsayisi: Number(element.mpc),
                kazanilanilcesayisi: Number(element.dc),
                toplamadaysayisi: Number(element.tc),
            });
        }
        GENEL.partiler.sort((a, b) => {
            const oyOraniA = parseFloat(a.oyorani);
            const oyOraniB = parseFloat(b.oyorani);
        
            return oyOraniB - oyOraniA;
        });
    } catch (error) {
        console.log(error)
        console.log("getDatas fonksiyonu hata verdi.")
    }
}
getDatas2().then(()=>{
    console.log("Genel Veriler getirildi!", new Date().toLocaleTimeString());
    setInterval(async() => {
        await getDatas2();
        console.log("Genel Veriler getirildi!", new Date().toLocaleTimeString());
    }, 30000);
});

app.get('/api/get/BelediyeSecim/:ilkodu', async(req, res) => {
    const ilkodu = req.params.ilkodu;
    if (!CLEANEDDATA[ilkodu]) {
        return res.status(400).send({status: false, message: "İl bulunamadı!"});
    }
    res.status(200).send({status: true, data: CLEANEDDATA[ilkodu]})
});
app.get('/api/get/BelediyeSecim', async(req, res) => {
    res.status(200).send({status: true, data: CLEANEDDATA})
});
app.get('/api/get/GenelBilgi', async(req, res) => {
    res.status(200).send({status: true, data: GENEL})
});

const ExpressServerPort = 80;
app.listen(ExpressServerPort, () => {
    console.log(`${ExpressServerPort} portunda SecimAPI çalıştırıldı!`);
});