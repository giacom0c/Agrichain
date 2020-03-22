import { Router, Request, Response } from 'express';
import { OilControllerBackEnd, InitServerIdentity } from '../convector';
import { Oil, Attribute } from 'oil-cc';
import { identityId } from '../env';

const router: Router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, origin } = req.body;
        const oilToCreate = new Oil({ id, origin });
        await OilControllerBackEnd.create(oilToCreate)
        res.status(201).send();
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const oilToReturn = new Oil(await OilControllerBackEnd.get(id));
        res.send(oilToReturn.toJSON());
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

router.post('/:id/add-attribute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { attributeId, content } = req.body;

        let attribute = new Attribute(attributeId);
        attribute.certifierID = 'mit';
        attribute.content = {
            level: 'dummy',
            honours: 'high',
            description: 'Important title!'
        };
        attribute.issuedDate = Date.now();

        const attributeToAdd = new Attribute(attributeId);
        attributeToAdd.content = content;
        attributeToAdd.issuedDate = Date.now();

        // Get the identity the server is using right now
        attributeToAdd.certifierID = identityId;

        await OilControllerBackEnd.addAttribute(id, attributeToAdd);

        const oilToReturn = new Oil(await OilControllerBackEnd.get(id));
        res.send(oilToReturn.toJSON());
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

export const OilExpressController: Router = router;
