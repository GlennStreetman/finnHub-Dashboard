import fetch from "node-fetch";
const rootURL = process.env.URL;

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

// interface gqlObj {
//     data: widget,
// }

export interface GQLReqObj {
    n: string; //data name
    q: string; //query string
    data?: widget; //GQL return data. Object or list.
}

export const getGraphQLData = (reqObj: GQLReqObj): Promise<GQLReqObj> => {
    //queries mongo database and attached returned data to request obj, then returns. hello
    return new Promise((resolve, reject) => {
        let queryParams = reqObj.q;
        const getAPIData = `/api/${rootURL}/qGraphQL?query=${queryParams}`;
        fetch(getAPIData)
            .then((r) => r.json())
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
