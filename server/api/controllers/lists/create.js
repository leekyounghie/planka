const Errors = {
  BOARD_NOT_FOUND: {
    notFound: 'Board is not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers
      .getBoardToProjectPath(inputs.boardId)
      .intercept('notFound', () => Errors.BOARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name']);

    const list = await sails.helpers.createList(board, values, this.req);

    return exits.success({
      item: list,
    });
  },
};
