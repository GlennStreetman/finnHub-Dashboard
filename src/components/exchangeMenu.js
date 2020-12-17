import React, { Component } from 'react'

export default class ExchangeMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //create import file?
            allExchanges: {
                AS:'NYSE EURONEXT - EURONEXT AMSTERDAM',
                AT:'ATHENS EXCHANGE S.A. CASH MARKET',
                AX:'ASX - ALL MARKETS',
                BA:'BOLSA DE COMERCIO DE BUENOS AIRES',
                BC:'BOLSA DE VALORES DE COLOMBIA',
                BD:'BUDAPEST STOCK EXCHANGE',
                BE:'BOERSE BERLIN',
                BK:'STOCK EXCHANGE OF THAILAND',
                BO:'BSE LTD',
                BR:'NYSE EURONEXT - EURONEXT BRUSSELS',
                CN:'CANADIAN NATIONAL STOCK EXCHANGE',
                CO:'OMX NORDIC EXCHANGE COPENHAGEN A/S',
                CR:'CARACAS STOCK EXCHANGE',
                DB:'DUBAI FINANCIAL MARKET',
                DE:'XETRA',
                DU:'BOERSE DUESSELDORF',
                F:'DEUTSCHE BOERSE AG',
                HE:'NASDAQ OMX HELSINKI LTD.',
                HK:'HONG KONG EXCHANGES AND CLEARING LTD',
                HM:'HANSEATISCHE WERTPAPIERBOERSE HAMBURG',
                IC:'NASDAQ OMX ICELAND',
                IR:'IRISH STOCK EXCHANGE - ALL MARKET',
                IS:'BORSA ISTANBUL',
                JK:'INDONESIA STOCK EXCHANGE',
                JO:'JOHANNESBURG STOCK EXCHANGE',
                KL:'BURSA MALAYSIA',
                KQ:'KOREA EXCHANGE (KOSDAQ)',
                KS:'KOREA EXCHANGE (STOCK MARKET)',
                L:'LONDON STOCK EXCHANGE',
                LS:'NYSE EURONEXT - EURONEXT LISBON',
                MC:'BOLSA DE MADRID',
                ME:'MOSCOW EXCHANGE',
                MI:'Italian Stock Exchange',
                MU:'BOERSE MUENCHEN',
                MX:'BOLSA MEXICANA DE VALORES (MEXICAN STOCK EXCHANGE)',
                NE:'AEQUITAS NEO EXCHANGE',
                NS:'NATIONAL STOCK EXCHANGE OF INDIA',
                NZ:'NEW ZEALAND EXCHANGE LTD',
                OL:'OSLO BORS ASA',
                PA:'NYSE EURONEXT - MARCHE LIBRE PARIS',
                PR:'PRAGUE STOCK EXCHANGE',
                QA:'QATAR EXCHANGE',
                RG:'NASDAQ OMX RIGA',
                SA:'Brazil Bolsa - Sao Paolo',
                SG:'BOERSE STUTTGART',
                SI:'SINGAPORE EXCHANGE',
                SN:'SANTIAGO STOCK EXCHANGE',
                SR:'SAUDI STOCK EXCHANGE',
                SS:'SHANGHAI STOCK EXCHANGE',
                ST:'NASDAQ OMX NORDIC',
                SW:'SWISS EXCHANGE',
                SZ:'SHENZHEN STOCK EXCHANGE',
                T:'TOKYO STOCK EXCHANGE-TOKYO PRO MARKET',
                TA:'TEL AVIV STOCK EXCHANGE',
                TL:'NASDAQ OMX TALLINN',
                TO:'TORONTO STOCK EXCHANGE',
                TW:'TAIWAN STOCK EXCHANGE',
                US:'US exchanges (NYSE, Nasdaq)',
                V:'TSX VENTURE EXCHANGE - NEX',
                VI:'Vienna Stock Exchange',
                VN:'Vietnam exchanges including HOSE, HNX and UPCOM',
                VS:'NASDAQ OMX VILNIUS',
                WA:'WARSAW STOCK EXCHANGE/EQUITIES/MAIN MARKET',
                
            },
        };

        this.baseState = {mounted: true}
        this.changeExchange = this.changeExchange.bind(this)

    }

    changeExchange(ex){
        const p = this.props
        const newExchangeList = [...p.exchangeList]
        if (p.exchangeList.indexOf(ex) >= 0) {
          newExchangeList.splice(p.exchangeList.indexOf(ex),1)
        } else {
          newExchangeList.push(ex)
        }

        const data = {
            field: "exchangelist",
            newValue: newExchangeList.toString().replace("'", ),
        };

        const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        };

        fetch("/accountData", options)
            .then((response) => response.json())
            .then((data) => {
            if (this.baseState.mounted === true) {
                console.log("Exchange list updated.", data)
                this.props.updateExchangeList(newExchangeList)
            }   
            });

    }

    render() {
        const s = this.state
        const p = this.props
        console.log(p.exchangeList.indexOf('US'))
        const exchangeListRows = Object.entries(s.allExchanges).map((el) => 
            
                <tr key={el[0]+ 'row'}>
                    <td key={el[0]+ 'symbol'}>{el[0]}</td>
                    <td key={el[0]+ 'desc'}>{el[1]}</td>
                    <td key={el[0]+ 'box'}>
                        <input key={el[0]+ 'mark'}
                            type="checkbox" 
                            // onChange={() => this.props.updateExchangeList(el[0])} 
                            onChange={() => this.changeExchange(el[0])} 
                            checked={p.exchangeList.indexOf(el[0]) >= 0} /> 
                    </td>
                </tr>
            
        )

        return (
            <div >
                <table >
                    <thead>
                        <tr>
                            <td>Short</td>
                            <td>Description</td>
                            <td>Activate</td>
                        </tr>
                    </thead>
                    <tbody>
                        {exchangeListRows}
                    </tbody>
                </table>
            </div>
        )
    }
}

export function exchangeMenuProps(that) {
    let propList = {
        exchangeList: that.state.exchangeList,
        updateExchangeList: that.updateExchangeList,
    };
    return propList;
  }

