import fetch from "node-fetch";

interface dataNode {
    dashboard: string;
    widgetType: string;
    widgetName: string;
    security: string;
    data: any;
}

interface widget {
    widget: dataNode[];
}

export interface GQLReqObj {
    n: string; //data name
    q: string; //query string
    data?: widget; //GQL return data. Object or list.
}

export const getGraphQLData = (reqObj: GQLReqObj): Promise<GQLReqObj> => {
    //queries mongo database and attached returned data to request obj, then returns. hello
    return new Promise((resolve, reject) => {
        let queryParams = reqObj.q;
        const getAPIData = `${process.env.REACT_APP_BASEURL}/api/qGraphQL?query=${queryParams}`;
        fetch(getAPIData)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                for (const x in data) {
                    reqObj.data = data[x];
                    resolve(reqObj);
                }
            })
            .catch((err) => {
                console.log("error: ", err);
                reject(err);
            });
    });
};

// export { getGraphQLData }
