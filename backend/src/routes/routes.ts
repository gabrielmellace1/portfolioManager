/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AssetController } from './../controllers/AssetController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PortfolioController } from './../controllers/PortfolioController';
import type { RequestHandler, Router } from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "AssetType": {
        "dataType": "refEnum",
        "enums": ["stock","option","bond","crypto","cash"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OptionType": {
        "dataType": "refEnum",
        "enums": ["call","put"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Asset": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "type": {"ref":"AssetType","required":true},
            "ticker": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "purchasePrice": {"dataType":"double","required":true},
            "currentPrice": {"dataType":"double"},
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "strikePrice": {"dataType":"double"},
            "expirationDate": {"dataType":"datetime"},
            "optionType": {"ref":"OptionType"},
            "couponRate": {"dataType":"double"},
            "maturityDate": {"dataType":"datetime"},
            "faceValue": {"dataType":"double"},
            "symbol": {"dataType":"string"},
            "portfolio": {"ref":"Portfolio"},
            "portfolioId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Portfolio": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "assets": {"dataType":"array","array":{"dataType":"refObject","ref":"Asset"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateAssetDto": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"AssetType","required":true},
            "ticker": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "purchasePrice": {"dataType":"double","required":true},
            "portfolioId": {"dataType":"double","required":true},
            "purchaseDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "strikePrice": {"dataType":"double"},
            "expirationDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "optionType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["call"]},{"dataType":"enum","enums":["put"]}]},
            "couponRate": {"dataType":"double"},
            "maturityDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "faceValue": {"dataType":"double"},
            "symbol": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateAssetDto": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"AssetType"},
            "ticker": {"dataType":"string"},
            "quantity": {"dataType":"double"},
            "purchasePrice": {"dataType":"double"},
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "currentPrice": {"dataType":"double"},
            "purchaseDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "strikePrice": {"dataType":"double"},
            "expirationDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "optionType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["call"]},{"dataType":"enum","enums":["put"]}]},
            "couponRate": {"dataType":"double"},
            "maturityDate": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}]},
            "faceValue": {"dataType":"double"},
            "symbol": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.number_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePortfolioDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePortfolioDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/assets',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAllAssets)),

            function AssetController_getAllAssets(request: any, response: any, next: any) {
            const args = {
                    page: {"in":"query","name":"page","dataType":"double"},
                    limit: {"in":"query","name":"limit","dataType":"double"},
                    sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                    sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    type: {"in":"query","name":"type","ref":"AssetType"},
                    portfolioId: {"in":"query","name":"portfolioId","dataType":"double"},
                    ticker: {"in":"query","name":"ticker","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAllAssets.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/:id',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAssetById)),

            function AssetController_getAssetById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAssetById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/portfolio/:portfolioId',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAssetsByPortfolioId)),

            function AssetController_getAssetsByPortfolioId(request: any, response: any, next: any) {
            const args = {
                    portfolioId: {"in":"path","name":"portfolioId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAssetsByPortfolioId.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/type/:type',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAssetsByType)),

            function AssetController_getAssetsByType(request: any, response: any, next: any) {
            const args = {
                    type: {"in":"path","name":"type","required":true,"ref":"AssetType"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAssetsByType.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/search',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.searchAssets)),

            function AssetController_searchAssets(request: any, response: any, next: any) {
            const args = {
                    searchTerm: {"in":"query","name":"searchTerm","dataType":"string"},
                    minValue: {"in":"query","name":"minValue","dataType":"double"},
                    maxValue: {"in":"query","name":"maxValue","dataType":"double"},
                    minPnL: {"in":"query","name":"minPnL","dataType":"double"},
                    maxPnL: {"in":"query","name":"maxPnL","dataType":"double"},
                    profitableOnly: {"in":"query","name":"profitableOnly","dataType":"boolean"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.searchAssets.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/assets',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.createAsset)),

            function AssetController_createAsset(request: any, response: any, next: any) {
            const args = {
                    assetData: {"in":"body","name":"assetData","required":true,"ref":"CreateAssetDto"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.createAsset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/assets/:id',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.updateAsset)),

            function AssetController_updateAsset(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    assetData: {"in":"body","name":"assetData","required":true,"ref":"UpdateAssetDto"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.updateAsset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/assets/:id',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.deleteAsset)),

            function AssetController_deleteAsset(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.deleteAsset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/assets/:id/update-price',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.updateAssetPrice)),

            function AssetController_updateAssetPrice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.updateAssetPrice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/assets/update-all-prices',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.updateAllAssetPrices)),

            function AssetController_updateAllAssetPrices(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.updateAllAssetPrices.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/:id/performance',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAssetPerformance)),

            function AssetController_getAssetPerformance(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAssetPerformance.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/performance/metrics',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getPerformanceMetrics)),

            function AssetController_getPerformanceMetrics(request: any, response: any, next: any) {
            const args = {
                    portfolioId: {"in":"query","name":"portfolioId","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getPerformanceMetrics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/assets/statistics',
            ...(fetchMiddlewares<RequestHandler>(AssetController)),
            ...(fetchMiddlewares<RequestHandler>(AssetController.prototype.getAssetStatistics)),

            function AssetController_getAssetStatistics(request: any, response: any, next: any) {
            const args = {
                    portfolioId: {"in":"query","name":"portfolioId","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new AssetController();


              const promise = controller.getAssetStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getAllPortfolios)),

            function PortfolioController_getAllPortfolios(request: any, response: any, next: any) {
            const args = {
                    page: {"in":"query","name":"page","dataType":"double"},
                    limit: {"in":"query","name":"limit","dataType":"double"},
                    sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                    sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    searchTerm: {"in":"query","name":"searchTerm","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getAllPortfolios.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios/:id',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getPortfolioById)),

            function PortfolioController_getPortfolioById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getPortfolioById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/portfolios',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.createPortfolio)),

            function PortfolioController_createPortfolio(request: any, response: any, next: any) {
            const args = {
                    portfolioData: {"in":"body","name":"portfolioData","required":true,"ref":"CreatePortfolioDto"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.createPortfolio.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/portfolios/:id',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.updatePortfolio)),

            function PortfolioController_updatePortfolio(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    portfolioData: {"in":"body","name":"portfolioData","required":true,"ref":"UpdatePortfolioDto"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.updatePortfolio.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/portfolios/:id',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.deletePortfolio)),

            function PortfolioController_deletePortfolio(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.deletePortfolio.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios/:id/performance',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getPortfolioPerformance)),

            function PortfolioController_getPortfolioPerformance(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getPortfolioPerformance.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/portfolios/:id/assets',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.addAssetToPortfolio)),

            function PortfolioController_addAssetToPortfolio(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    assetData: {"in":"body","name":"assetData","required":true,"dataType":"any"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.addAssetToPortfolio.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/portfolios/:portfolioId/assets/:assetId',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.removeAssetFromPortfolio)),

            function PortfolioController_removeAssetFromPortfolio(request: any, response: any, next: any) {
            const args = {
                    portfolioId: {"in":"path","name":"portfolioId","required":true,"dataType":"double"},
                    assetId: {"in":"path","name":"assetId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.removeAssetFromPortfolio.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios/:id/summary',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getPortfolioSummary)),

            function PortfolioController_getPortfolioSummary(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getPortfolioSummary.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios/:id/assets',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getPortfolioAssets)),

            function PortfolioController_getPortfolioAssets(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getPortfolioAssets.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/portfolios/statistics',
            ...(fetchMiddlewares<RequestHandler>(PortfolioController)),
            ...(fetchMiddlewares<RequestHandler>(PortfolioController.prototype.getPortfolioStatistics)),

            function PortfolioController_getPortfolioStatistics(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PortfolioController();


              const promise = controller.getPortfolioStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            response.status(statusCode || 200)
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'queries':
                    return validationService.ValidateParam(args[key], request.query, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
