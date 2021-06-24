import { FinnHubAPIData } from '../../../../widgets/Fundamentals/Peers/peersBody'

interface resObjSetup { //rename
    peers: string[]
}

export default function recommendationTrendsGQLFilter(data: FinnHubAPIData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj: resObjSetup = { peers: [] }

    for (const d in data) {
        let peersList = resObj['peers']
        peersList.push(data[d])
    }
    return resObj
}