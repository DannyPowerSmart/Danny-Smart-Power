exports.handler = async () => {

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: true,
            message: "Danny Smart Power notification function is working!"
        })
    };

};
