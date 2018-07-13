import * as React from 'react';
import * as PropTypes from 'prop-types';

import { resultKeyNameFromField } from 'apollo-utilities';
import { graphql } from 'react-apollo';

import { mutatorHelper } from 'aws-appsync';

export const withGraphQL = (options) => (Component) => {
    const { document } = options;

    const A = graphql(
        document,
        options
    )(Component);

    const B = (props, context) => {
        const { client } = context;

        return (<A {...props} client={client} />);
    };
    (B as React.StatelessComponent).contextTypes = {
        client: PropTypes.object.isRequired
    }

    return B;
}

export const reactMutator = (mutation, cacheUpdateQuery, typename, idField) => {
    return {
        document: mutation,
        props: (props) => {
            const { ownProps: { client } } = props;
            const mutationName = resultKeyNameFromField(mutation.definitions[0].selectionSet.selections[0]);

            return {
                [mutationName]: (variables) => {
                    return props.mutate({
                        variables,
                        ...mutatorHelper(client, mutation, variables, cacheUpdateQuery, typename, undefined, idField),
                    });
                }
            }
        },
    };
};
