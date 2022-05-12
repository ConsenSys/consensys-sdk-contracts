const BasicNFT = artifacts.require("BasicNFT");

contract("BasicNFT", async (accounts) => {
    const roleAdmin = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const roleMinter = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
    const roleBurner = '0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848';
    const rolePauser = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
    let instance;

    beforeEach(async () => {
        instance = await BasicNFT.deployed();
    });

    it("should have owner be the deployer of the contract", async () => {
        const owner = await instance.owner();
        assert.equal(owner, accounts[0]);
    });

    it("should have the deployed name and symbol", async () => {
        const name = await instance.name.call();
        const symbol = await instance.symbol.call();
        assert.equal("My Test NFT", name);
        assert.equal("MTNFT", symbol);
    });

    it("should mint a new token", async () => {
        const tokenURIToStore = "ipfs://mysuperhash/0";
        await instance.mintWithTokenURI(accounts[1], tokenURIToStore, { from: accounts[0] });

        const balanceOfAccount1 = await instance.balanceOf.call(accounts[1]);
        assert.equal(1, balanceOfAccount1.toString());

        const tokenURI = await instance.tokenURI.call(0);
        assert.equal(tokenURIToStore, tokenURI);
    });

    it("should fail because account is not allowed to mint", async () => {
        try {
            await instance.mintWithTokenURI(accounts[1], "ipfs://mysuperhash/0", { from: accounts[1] });
        } catch (e) {
            assert.include(e.message, "is missing role");
        }
    });

    it("should return owner address", async () => {
        await instance.mintWithTokenURI(accounts[1], "ipfs://mysuperhash/0", { from: accounts[0] });

        const owner = await instance.ownerOf.call(0);
        assert.equal(accounts[1], owner);
    });

    it("should grant minter role to address", async () => {
        const hasRoleInitially = await instance.hasRole(roleMinter, accounts[1]);
        assert.equal(false, hasRoleInitially);

        await instance.addMinter(accounts[1], { from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(roleMinter, accounts[1]);
        assert.equal(true, hasRoleAfter);
    });

    it("should fail because account cannot give minter role", async () => {
        try {
            await instance.addMinter(accounts[1], { from: accounts[1] });
        } catch (e) {
            assert.include(e.message, "is missing role");
        }
    });

    it("should renounce minter role by address[0]", async () => {
        const hasRoleInitially = await instance.hasRole(roleMinter, accounts[0]);
        assert.equal(true, hasRoleInitially);

        await instance.renounceMinter({ from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(roleMinter, accounts[0]);
        assert.equal(false, hasRoleAfter);
    });

    it("should grant burner role to address", async () => {
        const hasRoleInitially = await instance.hasRole(roleBurner, accounts[1]);
        assert.equal(false, hasRoleInitially);

        await instance.addBurner(accounts[1], { from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(roleBurner, accounts[1]);
        assert.equal(true, hasRoleAfter);
    });

    it("should fail because account cannot give burner role", async () => {
        try {
            await instance.addBurner(accounts[1], { from: accounts[1] });
        } catch (e) {
            assert.include(e.message, "is missing role");
        }
    });

    it("should renounce burner role by address[0]", async () => {
        const hasRoleInitially = await instance.hasRole(roleBurner, accounts[0]);
        assert.equal(true, hasRoleInitially);

        await instance.renounceBurner({ from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(roleBurner, accounts[0]);
        assert.equal(false, hasRoleAfter);
    });

    it("should grant pauser role to address", async () => {
        const hasRoleInitially = await instance.hasRole(rolePauser, accounts[1]);
        assert.equal(false, hasRoleInitially);

        await instance.addPauser(accounts[1], { from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(rolePauser, accounts[1]);
        assert.equal(true, hasRoleAfter);
    });

    it("should fail because account cannot give pauser role", async () => {
        try {
            await instance.addPauser(accounts[1], { from: accounts[1] });
        } catch (e) {
            assert.include(e.message, "is missing role");
        }
    });

    it("should renounce pauser role by address[0]", async () => {
        const hasRoleInitially = await instance.hasRole(rolePauser, accounts[0]);
        assert.equal(true, hasRoleInitially);

        await instance.renouncePauser({ from: accounts[0] });

        const hasRoleAfter = await instance.hasRole(rolePauser, accounts[0]);
        assert.equal(false, hasRoleAfter);
    });

    it("should throw exception because token doesn't exist", async () => {
        try {
            await instance.ownerOf(1000);
        } catch (e) {
            assert.include(e.message, "ERC721: owner query for nonexistent token");
        }
    });

    it("should approve contract to other address", async () => {
        const approvedAddress = await instance.getApproved(0);
        
        if (approvedAddress !== '0x0000000000000000000000000000000000000000') {
            assert.fail("initial address is not zero address");
        }

        await instance.approve(accounts[2], 0, { from: accounts[1] });

        const approved = await instance.getApproved(0);
        assert.equal(accounts[2], approved);
    });
});