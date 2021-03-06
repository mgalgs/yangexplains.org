"""empty message

Revision ID: 131cbe6fbce2
Revises: a9ba118aeb5d
Create Date: 2019-08-24 20:30:40.749776

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '131cbe6fbce2'
down_revision = 'a9ba118aeb5d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('explainer_video', sa.Column('submitter', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'explainer_video', 'user', ['submitter'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'explainer_video', type_='foreignkey')
    op.drop_column('explainer_video', 'submitter')
    # ### end Alembic commands ###
